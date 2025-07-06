import React, { useEffect, useRef, useState } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';

// @ts-ignore
const vscode = window.acquireVsCodeApi ? window.acquireVsCodeApi() : { postMessage: () => {} };

type Tool = 'gemini' | 'claude';

const App: React.FC = () => {
  const termRef = useRef<HTMLDivElement>(null);
  const xterm = useRef<Terminal>(null);
  const fitAddon = useRef<FitAddon>(null);
  const [input, setInput] = useState('');
  const [currentTool, setCurrentTool] = useState<Tool>('gemini');
  const [isRunning, setIsRunning] = useState(false);

  // 터미널 초기화
  useEffect(() => {
    if (!termRef.current) return;
    if (!xterm.current) {
      xterm.current = new Terminal({
        cursorBlink: true,
        theme: { background: '#1e1e1e', foreground: '#cccccc' },
        fontSize: 14,
      });
      fitAddon.current = new FitAddon();
      xterm.current.loadAddon(fitAddon.current);
      xterm.current.open(termRef.current);
      fitAddon.current.fit();
      xterm.current.writeln('Welcome to AI CLI Terminal!');
      xterm.current.writeln(`Current tool: ${currentTool}`);
      xterm.current.write('$ ');
    }
    const handleResize = () => fitAddon.current?.fit();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 도구 전환 시 터미널 클리어
  useEffect(() => {
    if (xterm.current) {
      xterm.current.clear();
      xterm.current.writeln(`Switched to ${currentTool}`);
      xterm.current.write('$ ');
    }
  }, [currentTool]);

  // Webview 메시지 수신
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const msg = event.data;
      if (msg.type === 'commandOutput') {
        xterm.current?.write(msg.output);
      }
      if (msg.type === 'commandEnd') {
        setIsRunning(false);
        xterm.current?.write('$ ');
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  // 키 입력 처리
  useEffect(() => {
    if (!xterm.current) return;
    const term = xterm.current;
    const onKey = ({ key, domEvent }: any) => {
      if (isRunning) return;
      if (domEvent.key === 'Enter') {
        term.write('\r\n');
        if (input.trim()) {
          setIsRunning(true);
          vscode.postMessage({ type: 'runCommand', tool: currentTool, command: input.trim() });
        }
        setInput('');
      } else if (domEvent.key === 'Backspace') {
        if (input.length > 0) {
          term.write('\b \b');
          setInput(input.slice(0, -1));
        }
      } else if (!domEvent.altKey && !domEvent.ctrlKey && !domEvent.metaKey && key.length === 1) {
        term.write(key);
        setInput(input + key);
      }
    };
    term.onKey(onKey);
    return () => {};
  }, [input, isRunning, currentTool]);

  const handleSwitchTool = () => {
    setCurrentTool(currentTool === 'gemini' ? 'claude' : 'gemini');
  };

  return (
    <div className="flex flex-col h-screen bg-zinc-900 text-zinc-100">
      <div className="flex items-center gap-2 p-2 bg-zinc-800 border-b border-zinc-700">
        <button
          onClick={handleSwitchTool}
          disabled={isRunning}
          className="px-3 py-1 rounded bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 text-sm font-medium transition"
        >
          Switch to {currentTool === 'gemini' ? 'Claude' : 'Gemini'}
        </button>
        <span className="ml-2 text-xs text-zinc-400">Current: {currentTool}</span>
      </div>
      <div className="flex-1">
        <div ref={termRef} className="w-full h-full" />
      </div>
    </div>
  );
};

export default App;
