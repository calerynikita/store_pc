import React, { useState } from 'react';
import { QueueSettings } from '../types';
import { Sliders, CheckSquare, Square, Volume2, Save, RotateCcw, AlertCircle, Info } from 'lucide-react';

interface QueueSettingsTabProps {
  settings: QueueSettings;
  setSettings: React.Dispatch<React.SetStateAction<QueueSettings>>;
}

export default function QueueSettingsTab({ settings, setSettings }: QueueSettingsTabProps) {
  // Local working state
  const [enabled, setEnabled] = useState(settings.enabled);
  const [prefix, setPrefix] = useState<string>(settings.prefix);
  const [startNo, setStartNo] = useState(settings.startNo);
  
  const [reminderVoice, setReminderVoice] = useState(settings.reminders.voice);
  const [reminderSms, setReminderSms] = useState(settings.reminders.sms);
  const [reminderRequeue, setReminderRequeue] = useState(settings.reminders.requeue);

  // Status for notification
  const [savedStatus, setSavedStatus] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prefix.trim()) {
      alert('号码前缀不能为空，请输入或选择前缀！');
      return;
    }
    setSettings({
      enabled,
      prefix,
      startNo: Number(startNo),
      reminders: {
        voice: reminderVoice,
        sms: reminderSms,
        requeue: reminderRequeue
      }
    });

    setSavedStatus('设置保存成功！配置已实时应用到排号系统。');
    setTimeout(() => {
      setSavedStatus(null);
    }, 4000);
  };

  const handleReset = () => {
    setEnabled(true);
    setPrefix('A');
    setStartNo(1);
    setReminderVoice(true);
    setReminderSms(false);
    setReminderRequeue(true);
    
    setSavedStatus('已重置为默认配置，请点击保存以应用更改。');
    setTimeout(() => {
      setSavedStatus(null);
    }, 4000);
  };

  return (
    <div className="space-y-6">
      
      {/* Title section with Breadcrumbs */}
      <div>
        <div className="text-xs text-gray-400 flex items-center gap-1.5 mb-1.5">
          <span>线下</span>
          <span>&gt;</span>
          <span>叫号管理</span>
          <span>&gt;</span>
          <span className="text-gray-600 font-medium">叫号设置</span>
        </div>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">叫号设置</h1>
        <p className="text-xs text-gray-400 mt-0.5">配置叫号系统的基本参数，包括票号前缀、叫号类型和提醒规则。</p>
      </div>

      {/* Save Success Alert */}
      {savedStatus && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3 text-emerald-800 animate-fade-in">
          <div className="p-1 bg-emerald-100 rounded-lg text-emerald-700 mt-0.5">
            <Volume2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-semibold text-xs text-emerald-900">操作成功</h4>
            <p className="text-xs text-emerald-800/90 mt-0.5">{savedStatus}</p>
          </div>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="bg-white border border-gray-100 rounded-2xl shadow-xs overflow-hidden max-w-3xl">
        
        {/* Section 1: 基础设置 */}
        <div className="p-6 border-b border-gray-100 space-y-6">
          <div className="flex items-center gap-2 pb-1 border-b border-gray-50">
            <Sliders className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-gray-800">基础设置</h2>
          </div>

          <div className="space-y-5">
            {/* 1.1 开启叫号系统 */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-semibold text-gray-800 block">开启叫号系统</label>
                <span className="text-[11px] text-gray-400">开启后，门店可使用叫号功能、生成排队小票及打印</span>
              </div>
              <button
                type="button"
                onClick={() => setEnabled(!enabled)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  enabled ? 'bg-indigo-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* 1.2 号码前缀 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-1.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-800 block">号码前缀</label>
                <span className="text-[11px] text-gray-400 block">设置叫号的前缀字母或自定义编号（支持大写英文字母和数字）</span>
              </div>
              <div className="flex flex-col sm:items-end gap-2 shrink-0">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="输入自定义前缀"
                    value={prefix}
                    onChange={(e) => {
                      // Only allow alphanumeric characters and force uppercase
                      const val = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
                      setPrefix(val);
                    }}
                    className="w-40 px-3 py-1.5 text-xs font-bold border border-gray-200 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-white text-center tracking-wider placeholder:font-normal placeholder:tracking-normal font-mono shadow-3xs"
                  />
                  {prefix.trim().length > 0 && (
                    <span className="text-[10px] text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-1 rounded-md font-bold font-mono">
                      格式：{prefix}001
                    </span>
                  )}
                </div>
                {/* Quick select presets */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-gray-400">快捷推荐：</span>
                  {['A', 'B', 'C', 'VIP', 'DX', 'JH'].map((preset) => {
                    const isSelected = prefix === preset;
                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setPrefix(preset)}
                        className={`text-[10px] px-2 py-0.5 rounded-md font-bold border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-3xs'
                            : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-600'
                        }`}
                      >
                        {preset}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 1.3 起始号码 */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-semibold text-gray-800 block">起始号码</label>
                <span className="text-[11px] text-gray-400">每天叫号从该号码开始，重新生成排队序列</span>
              </div>
              <div className="w-28">
                <input
                  type="number"
                  min={1}
                  max={999}
                  required
                  value={startNo}
                  onChange={(e) => setStartNo(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full text-center px-3 py-1.5 text-xs font-bold border border-gray-200 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-gray-50/50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: 叫号类型 */}
        <div className="p-6 border-b border-gray-100 space-y-4">
          <div className="flex items-center gap-2 pb-1 border-b border-gray-50">
            <CheckSquare className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-gray-800">叫号类型</h2>
          </div>

          <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 flex items-start gap-3">
            <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg shrink-0">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-indigo-900 flex items-center gap-2">
                <span>现货</span>
                <span className="bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm">默认启用</span>
              </h4>
              <p className="text-[11px] text-indigo-800/80 mt-1 leading-relaxed">
                当前系统已配置为“仅支持现货取号”模式。顾客可通过扫码直接生成现货号单，无需进行其他业务类型的控制或配置。
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: 提醒设置 */}
        <div className="p-6 border-b border-gray-100 space-y-6">
          <div className="flex items-center gap-2 pb-1 border-b border-gray-50">
            <Volume2 className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-gray-800">提醒设置</h2>
          </div>

          <div className="space-y-5">
            {/* 3.1 语音播报 */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-semibold text-gray-800 block">语音播报</label>
                <span className="text-[11px] text-gray-400">叫号时自动启用普通话合成语音进行公网广播播报</span>
              </div>
              <button
                type="button"
                onClick={() => setReminderVoice(!reminderVoice)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  reminderVoice ? 'bg-indigo-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    reminderVoice ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* 3.2 短信提醒 */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-semibold text-gray-800 block">短信提醒</label>
                <span className="text-[11px] text-gray-400">当轮到该顾客或前方还有 3 人排队时，自动发送短信通知</span>
              </div>
              <button
                type="button"
                onClick={() => setReminderSms(!reminderSms)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  reminderSms ? 'bg-indigo-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    reminderSms ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* 3.3 过号重排 */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-semibold text-gray-800 block">过号重排</label>
                <span className="text-[11px] text-gray-400">顾客过号未能到场时，系统自动将其挪到队列最后重新排队</span>
              </div>
              <button
                type="button"
                onClick={() => setReminderRequeue(!reminderRequeue)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  reminderRequeue ? 'bg-indigo-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    reminderRequeue ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 bg-gray-50 flex items-center justify-center sm:justify-start gap-3">
          <button
            type="submit"
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 shadow-md active:scale-98 transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            <span>保存设置</span>
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-5 py-2 bg-white hover:bg-gray-100 border border-gray-200 text-gray-600 font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>重置</span>
          </button>
        </div>

      </form>
    </div>
  );
}
