var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import './App.css';
var STORAGE_KEY = 'mini-cursor-todos';
var filters = [
    { value: 'all', label: '全部' },
    { value: 'active', label: '进行中' },
    { value: 'completed', label: '已完成' },
];
var initialTodos = [
    {
        id: 'seed-1',
        text: '运行 mini-cursor 生成 React 项目',
        completed: true,
        createdAt: Date.now() - 3000,
    },
    {
        id: 'seed-2',
        text: '把默认 Vite 页面改成 TodoList',
        completed: false,
        createdAt: Date.now() - 2000,
    },
    {
        id: 'seed-3',
        text: '验证添加、筛选、本地保存',
        completed: false,
        createdAt: Date.now() - 1000,
    },
];
function loadTodos() {
    try {
        var saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : initialTodos;
    }
    catch (_a) {
        return initialTodos;
    }
}
function App() {
    var _a = useState(loadTodos), todos = _a[0], setTodos = _a[1];
    var _b = useState(''), input = _b[0], setInput = _b[1];
    var _c = useState('all'), filter = _c[0], setFilter = _c[1];
    var activeCount = todos.filter(function (todo) { return !todo.completed; }).length;
    var completedCount = todos.length - activeCount;
    var completionRate = todos.length
        ? Math.round((completedCount / todos.length) * 100)
        : 0;
    var visibleTodos = useMemo(function () {
        if (filter === 'active') {
            return todos.filter(function (todo) { return !todo.completed; });
        }
        if (filter === 'completed') {
            return todos.filter(function (todo) { return todo.completed; });
        }
        return todos;
    }, [filter, todos]);
    var saveTodos = function (nextTodos) {
        setTodos(nextTodos);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextTodos));
    };
    var addTodo = function (event) {
        event.preventDefault();
        var text = input.trim();
        if (!text) {
            return;
        }
        saveTodos(__spreadArray([
            {
                id: crypto.randomUUID(),
                text: text,
                completed: false,
                createdAt: Date.now(),
            }
        ], todos, true));
        setInput('');
    };
    var toggleTodo = function (id) {
        saveTodos(todos.map(function (todo) {
            return todo.id === id ? __assign(__assign({}, todo), { completed: !todo.completed }) : todo;
        }));
    };
    var deleteTodo = function (id) {
        saveTodos(todos.filter(function (todo) { return todo.id !== id; }));
    };
    var clearCompleted = function () {
        saveTodos(todos.filter(function (todo) { return !todo.completed; }));
    };
    return (_jsx("main", { className: "todo-shell", children: _jsxs("section", { className: "todo-panel", children: [_jsxs("div", { className: "hero-copy", children: [_jsx("span", { className: "eyebrow", children: "Mini Cursor Todo" }), _jsx("h1", { children: "\u4ECA\u5929\u7684\u4EFB\u52A1\uFF0C\u6E05\u6E05\u695A\u695A\u3002" }), _jsx("p", { children: "\u6DFB\u52A0\u5F85\u529E\u3001\u6807\u8BB0\u5B8C\u6210\u3001\u6309\u72B6\u6001\u7B5B\u9009\uFF0C\u6240\u6709\u6570\u636E\u4F1A\u81EA\u52A8\u4FDD\u5B58\u5728\u6D4F\u89C8\u5668\u672C\u5730\u3002" })] }), _jsxs("form", { className: "todo-form", onSubmit: addTodo, children: [_jsx("input", { "aria-label": "\u8F93\u5165\u65B0\u7684\u5F85\u529E", value: input, onChange: function (event) { return setInput(event.target.value); }, placeholder: "\u4F8B\u5982\uFF1A\u5B8C\u5584 LangChain Agent \u5DE5\u5177\u8C03\u7528" }), _jsx("button", { type: "submit", children: "\u6DFB\u52A0" })] }), _jsxs("div", { className: "stats-grid", children: [_jsxs("article", { children: [_jsx("strong", { children: todos.length }), _jsx("span", { children: "\u5168\u90E8\u4EFB\u52A1" })] }), _jsxs("article", { children: [_jsx("strong", { children: activeCount }), _jsx("span", { children: "\u8FDB\u884C\u4E2D" })] }), _jsxs("article", { children: [_jsxs("strong", { children: [completionRate, "%"] }), _jsx("span", { children: "\u5B8C\u6210\u7387" })] })] }), _jsxs("div", { className: "toolbar", children: [_jsx("div", { className: "filter-tabs", "aria-label": "\u4EFB\u52A1\u7B5B\u9009", children: filters.map(function (item) { return (_jsx("button", { className: filter === item.value ? 'active' : '', type: "button", onClick: function () { return setFilter(item.value); }, children: item.label }, item.value)); }) }), _jsx("button", { className: "ghost-button", type: "button", onClick: clearCompleted, disabled: completedCount === 0, children: "\u6E05\u9664\u5DF2\u5B8C\u6210" })] }), _jsx("ul", { className: "todo-list", children: visibleTodos.map(function (todo) { return (_jsxs("li", { className: todo.completed ? 'completed' : '', children: [_jsxs("label", { children: [_jsx("input", { checked: todo.completed, type: "checkbox", onChange: function () { return toggleTodo(todo.id); } }), _jsx("span", { children: todo.text })] }), _jsx("button", { "aria-label": "\u5220\u9664 ".concat(todo.text), type: "button", onClick: function () { return deleteTodo(todo.id); }, children: "\u5220\u9664" })] }, todo.id)); }) }), visibleTodos.length === 0 && (_jsx("div", { className: "empty-state", children: "\u8FD9\u4E2A\u5206\u7C7B\u6682\u65F6\u6CA1\u6709\u4EFB\u52A1\u3002" }))] }) }));
}
export default App;
