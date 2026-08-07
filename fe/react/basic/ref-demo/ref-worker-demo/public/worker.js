// Web Worker: 在后台线程中计算
self.onmessage = (e) => {
  const n = e.data;
  let sum = 0;
  for (let i = 0; i < n; i++) {
    sum += i;
  }
  self.postMessage(sum);
};
