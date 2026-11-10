// schema 包， 专门放数据结构体、模型定义， 约定数据长啥样
package schema

import "encoding/json"

// type 类型别名
type Role string

// 定义常量， （） 一次定义一批常量
const (
	// 常量要大写 类型是 Role
	RoleSystem    Role = "system"
	RoleUser      Role = "user"
	RoleAssistant Role = "assistant"
)

// Go 没有类， 用结构体 struct 承载数据， 配合方法实现类似类的能力
// Message 上下文中的单条消息
type Message struct {
	// 字段名  类型 public  序列化时， role 作为字段名
	Role    Role   `json:"role"`
	Content string `json:"content"` // 纯文本内容
	// 如果模型决定调用工具， 此字段被填充
	// omitempty 序列化时如果为空， 不会包含在JSON中
	ToolCalls []ToolCall `json:"tool_calls,omitempty"`
	// 如果这是对某个工具的响应， 字段需要带上
	ToolCallID string `json:"tool_call_id,omitempty"`
}

type ToolCall struct {
	ID   string `json:"id"`   // 工具调用的唯一ID
	Name string `json:"name"` // 想要调用的工具名称(read, bash)
	// Arguments 存放JSON 参数。 使用RawMessage 时为了延迟解析，
	// 将解析责任交给具体的工具，
	Arguments json.RawMessage `json:"arguments"`
}

// 工具执行完毕后返回的物理结果
type TodoResult struct {
	ToolCallID string `json:"tool_call_id"`
	Output     string `json:"output"`
	IsError    bool   `json:"is_error"`
}

type ToolDefinition struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	// interface 接口  工具的参数是确定不了的  任意类型的值
	InputSchema interface{} `json:"input_schema"`
}
