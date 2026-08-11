import {
  AutoTokenizer,
  AutoModelForCausalLM,
  TextStreamer,
  InterruptableStoppingCriteria,
} from "@huggingface/transformers";

let fp16_supported = false;
let gpuAdapter = null;

async function check() {
  try {
    gpuAdapter = await navigator.gpu.requestAdapter();
    if (!gpuAdapter) {
      throw new Error("WebGPU is not supported (no adapter found)");
    }
    fp16_supported = gpuAdapter.features.has("shader-f16");
    self.postMessage({
      status: "checked",
      data: `WebGPU OK, fp16: ${fp16_supported}`,
    });
  } catch (e) {
    self.postMessage({
      status: "error",
      data: e.toString(),
    });
  }
}

class TextGenerationPipeline {
  static model_id = "onnx-community/DeepSeek-R1-Distill-Qwen-1.5B-ONNX";

  static async getInstance(progress_callback = null) {
    const dtype = fp16_supported ? "q4f16" : "q4";
    self.postMessage({
      status: "loading",
      data: `Loading model files (dtype: ${dtype})...`,
    });

    this.tokenizer ??= AutoTokenizer.from_pretrained(this.model_id, {
      progress_callback,
    });

    this.model ??= AutoModelForCausalLM.from_pretrained(this.model_id, {
      dtype,
      device: "webgpu",
      progress_callback,
    });

    return Promise.all([this.tokenizer, this.model]);
  }
}

const stopping_criteria = new InterruptableStoppingCriteria();

let past_key_values_cache = null;
async function generate(messages) {
  const [tokenizer, model] = await TextGenerationPipeline.getInstance();

  const inputs = tokenizer.apply_chat_template(messages, {
    add_generation_prompt: true,
    return_dict: true,
  });

  const [START_THINKING_TOKEN_ID, END_THINKING_TOKEN_ID] = tokenizer.encode(
    "<think></think>",
    { add_special_tokens: false },
  );

  let state = "thinking";
  let startTime;
  let numTokens = 0;
  let tps;
  const token_callback_function = (tokens) => {
    startTime ??= performance.now();

    if (numTokens++ > 0) {
      tps = (numTokens / (performance.now() - startTime)) * 1000;
    }
    if (tokens[0] == END_THINKING_TOKEN_ID) {
      state = "answering";
    }
  };
  const callback_function = (output) => {
    self.postMessage({
      status: "update",
      output,
      tps,
      numTokens,
      state,
    });
  };

  const streamer = new TextStreamer(tokenizer, {
    skip_prompt: true,
    skip_special_tokens: true,
    callback_function,
    token_callback_function,
  });

  self.postMessage({ status: "start" });

  const { past_key_values, sequences } = await model.generate({
    ...inputs,
    do_sample: false,
    max_new_tokens: 2048,
    streamer,
    stopping_criteria,
    return_dict_in_generate: true,
  });
  past_key_values_cache = past_key_values;

  const decoded = tokenizer.batch_decode(sequences, {
    skip_special_tokens: true,
  });

  self.postMessage({
    status: "complete",
    output: decoded,
  });
}

async function load() {
  self.postMessage({
    status: "loading",
    data: "Loading model files...",
  });

  const [tokenizer, model] = await TextGenerationPipeline.getInstance((x) => {
    // #region debug-point progress-callback
    console.log("[DEBUG] progress_callback:", JSON.stringify(x));
    // #endregion
    self.postMessage(x);
  });

  self.postMessage({
    status: "loading",
    data: "Compiling shaders and warming up model (may take 1-2 min)...",
  });

  try {
    const inputs = tokenizer("a");
    await model.generate({ ...inputs, max_new_tokens: 1 });
    self.postMessage({ status: "ready" });
  } catch (e) {
    self.postMessage({
      status: "error",
      data: `Warmup failed: ${e.message}`,
    });
  }
}

self.addEventListener("message", async (e) => {
  const { type, data } = e.data;

  switch (type) {
    case "check":
      check();
      break;
    case "load":
      load();
      break;
    case "generate":
      stopping_criteria.reset();
      generate(data);
      break;
    case "interrupt":
      stopping_criteria.interrupt();
      break;
    case "reset":
      past_key_values_cache = null;
      stopping_criteria.reset();
      break;
  }
});
