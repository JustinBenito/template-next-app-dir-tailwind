import React, { useState, useEffect } from 'react';

// Color picker component
const ColorPicker: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
}> = ({ label, value, onChange }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="flex items-center text-black gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 text-black rounded-lg border border-gray-300 cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a8324a] focus:border-transparent text-sm"
          placeholder="#000000"
        />
      </div>
    </div>
  );
};

// Preset style configurations
export const PRESET_STYLES = {
  tiktok: {
    container: { justifyContent: "center", alignItems: "center", left: 0, top: 0, right: undefined, bottom: undefined, height: undefined },
    fontSize: 220,
    highlightColor: "#39E508",
    strokeWidth: "20px",
    strokeColor: "black",
    textTransform: "uppercase" as const,
    fontFamily: 'Impact, Charcoal, sans-serif',
  },
  minimal: {
    container: { justifyContent: "center", alignItems: "center", left: 0, top: 0, right: undefined, bottom: undefined, height: undefined },
    fontSize: 180,
    highlightColor: "#ffffff",
    strokeWidth: "0px",
    strokeColor: "transparent",
    textTransform: "none" as const,
    fontFamily: 'Arial, Helvetica, sans-serif',
  },
  neon: {
    container: { justifyContent: "center", alignItems: "center", left: 0, top: 0, right: undefined, bottom: undefined, height: undefined },
    fontSize: 200,
    highlightColor: "#00ffff",
    strokeWidth: "8px",
    strokeColor: "#00ffff",
    textTransform: "uppercase" as const,
    fontFamily: 'Courier New, Courier, monospace',
  },
  retro: {
    container: { justifyContent: "center", alignItems: "center", left: 0, top: 0, right: undefined, bottom: undefined, height: undefined },
    fontSize: 190,
    highlightColor: "#ff6b35",
    strokeWidth: "12px",
    strokeColor: "#2c1810",
    textTransform: "uppercase" as const,
    fontFamily: 'Georgia, serif',
  },
  elegant: {
    container: { justifyContent: "center", alignItems: "center", left: 0, top: 0, right: undefined, bottom: undefined, height: undefined },
    fontSize: 170,
    highlightColor: "#f8f9fa",
    strokeWidth: "3px",
    strokeColor: "#343a40",
    textTransform: "none" as const,
    fontFamily: 'Times New Roman, Times, serif',
  },
  aestheticGlow: {
    container: { justifyContent: "center", alignItems: "center", left: 0, top: 0, right: undefined, bottom: undefined, height: undefined },
    fontSize: 200,
    highlightColor: "#ffffff",
    strokeWidth: "6px",
    strokeColor: "#ffc0cb",
    textTransform: "capitalize" as const,
    fontFamily: 'Verdana, Geneva, sans-serif',
  },
  boldPop: {
    container: { justifyContent: "center", alignItems: "center", left: 0, top: 0, right: undefined, bottom: undefined, height: undefined },
    fontSize: 220,
    highlightColor: "#ffdd00",
    strokeWidth: "14px",
    strokeColor: "#000000",
    textTransform: "uppercase" as const,
    fontFamily: 'Trebuchet MS, Helvetica, sans-serif',
  },
  cyberWave: {
    container: { justifyContent: "center", alignItems: "center", left: 0, top: 0, right: undefined, bottom: undefined, height: undefined },
    fontSize: 210,
    highlightColor: "#00f0ff",
    strokeWidth: "10px",
    strokeColor: "#0f0f0f",
    textTransform: "uppercase" as const,
    fontFamily: 'Lucida Console, Monaco, monospace',
  },
  pastelSoft: {
    container: { justifyContent: "center", alignItems: "center", left: 0, top: 0, right: undefined, bottom: undefined, height: undefined },
    fontSize: 180,
    highlightColor: "#fde2e4",
    strokeWidth: "4px",
    strokeColor: "#fcd5ce",
    textTransform: "capitalize" as const,
    fontFamily: 'Palatino, Palatino Linotype, serif',
  },
  glassGlow: {
    container: { justifyContent: "center", alignItems: "center", left: 0, top: 0, right: undefined, bottom: undefined, height: undefined },
    fontSize: 200,
    highlightColor: "#e0f7fa",
    strokeWidth: "6px",
    strokeColor: "rgba(255, 255, 255, 0.4)",
    textTransform: "uppercase" as const,
    fontFamily: 'Tahoma, Geneva, sans-serif',
  },
  cinematic: {
    container: { justifyContent: "center", alignItems: "center", left: 0, top: 0, right: undefined, bottom: undefined, height: undefined },
    fontSize: 200,
    highlightColor: "#ffffff",
    strokeWidth: "10px",
    strokeColor: "#000000",
    textTransform: "uppercase" as const,
    fontFamily: 'Arial Black, Gadget, sans-serif',
  },
  dangerZone: {
    container: { justifyContent: "center", alignItems: "center", left: 0, top: 0, right: undefined, bottom: undefined, height: undefined },
    fontSize: 220,
    highlightColor: "#ff1744",
    strokeWidth: "10px",
    strokeColor: "#000000",
    textTransform: "uppercase" as const,
    fontFamily: 'Copperplate, Papyrus, fantasy',
  },
  vaporwave: {
    container: { justifyContent: "center", alignItems: "center", left: 0, top: 0, right: undefined, bottom: undefined, height: undefined },
    fontSize: 200,
    highlightColor: "#ff77ff",
    strokeWidth: "6px",
    strokeColor: "#00ffee",
    textTransform: "uppercase" as const,
    fontFamily: 'Comic Sans MS, Comic Sans, cursive',
  },
  skyBlue: {
    container: { justifyContent: "center", alignItems: "center", left: 0, top: 0, right: undefined, bottom: undefined, height: undefined },
    fontSize: 190,
    highlightColor: "#bbf0ff",
    strokeWidth: "5px",
    strokeColor: "#1e90ff",
    textTransform: "capitalize" as const,
    fontFamily: 'Gill Sans, Gill Sans MT, Calibri, sans-serif',
  },
  funkyGraffiti: {
    container: { justifyContent: "center", alignItems: "center", left: 0, top: 0, right: undefined, bottom: undefined, height: undefined },
    fontSize: 210,
    highlightColor: "#fffd00",
    strokeWidth: "12px",
    strokeColor: "#ff0080",
    textTransform: "uppercase" as const,
    fontFamily: 'Brush Script MT, cursive',
  },
  luxeGold: {
    container: { justifyContent: "center", alignItems: "center", left: 0, top: 0, right: undefined, bottom: undefined, height: undefined },
    fontSize: 200,
    highlightColor: "#ffd700",
    strokeWidth: "6px",
    strokeColor: "#000000",
    textTransform: "uppercase" as const,
    fontFamily: 'Optima, Segoe, Segoe UI, Candara, Calibri, Arial, sans-serif',
  },
  ghostWhite: {
    container: { justifyContent: "center", alignItems: "center", left: 0, top: 0, right: undefined, bottom: undefined, height: undefined },
    fontSize: 180,
    highlightColor: "#f8f8ff",
    strokeWidth: "4px",
    strokeColor: "#d3d3d3",
    textTransform: "capitalize" as const,
    fontFamily: 'Franklin Gothic Medium, Arial Narrow, Arial, sans-serif',
  },
};

export type SubtitleStyle = keyof typeof PRESET_STYLES;

export interface SubtitleStyleConfig {
  container: {
    justifyContent: string;
    alignItems: string;
    left?: number;
    top?: number;
    right?: number;
    bottom?: number;
    height?: number;
  };
  fontSize: number;
  highlightColor: string;
  strokeWidth: string;
  strokeColor: string;
  textTransform: "none" | "uppercase" | "lowercase" | "capitalize";
  fontFamily?: string;
}

export interface SubtitleStyleSelectorProps {
  selectedStyle: SubtitleStyle;
  onStyleChange: (style: SubtitleStyle) => void;
  customStyle: Partial<SubtitleStyleConfig>;
  onCustomStyleChange: (style: Partial<SubtitleStyleConfig>) => void;
  onApplyCustomStyle?: () => void;
  onPreviewPreset?: (style: SubtitleStyle) => void;
  activeTab: 'preset' | 'custom';
  setActiveTab: (tab: 'preset' | 'custom') => void;
}

export const SubtitleStyleSelector: React.FC<SubtitleStyleSelectorProps> = ({
  selectedStyle,
  onStyleChange,
  customStyle,
  onCustomStyleChange,
  onPreviewPreset,
  onApplyCustomStyle,
  activeTab,
  setActiveTab,
}) => {
  const [pendingPreset, setPendingPreset] = useState<SubtitleStyle>(selectedStyle);

  // Effect: Preview preset in real time when selected in preset tab
  useEffect(() => {
    if (activeTab === 'preset' && onPreviewPreset) {
      onPreviewPreset(pendingPreset);
    }
    // When leaving preset tab, revert preview to selectedStyle
    if (activeTab === 'custom' && onPreviewPreset) {
      onPreviewPreset(selectedStyle);
    }
  }, [activeTab, pendingPreset, selectedStyle, onPreviewPreset]);

  // When Apply Preset is clicked, set style and clear custom overrides
  const handleApplyPreset = () => {
    onStyleChange(pendingPreset);
    onCustomStyleChange({});
  };

  // When custom style changes, always take priority and preview in real time
  useEffect(() => {
    if (activeTab === 'custom' && onPreviewPreset) {
      onPreviewPreset(selectedStyle);
    }
  }, [customStyle, activeTab, selectedStyle, onPreviewPreset]);

  // Merge preset and custom style (custom overrides preset)
  const preset = PRESET_STYLES[selectedStyle];
  const mergedStyle: SubtitleStyleConfig = {
    container: {
      justifyContent: customStyle.container?.justifyContent ?? preset.container.justifyContent ?? 'center',
      alignItems: customStyle.container?.alignItems ?? preset.container.alignItems ?? 'center',
      left: customStyle.container?.left ?? preset.container.left ?? 0,
      top: customStyle.container?.top ?? preset.container.top ?? 0,
      right: customStyle.container?.right ?? preset.container.right ?? 0,
      bottom: customStyle.container?.bottom ?? preset.container.bottom ?? 0,
      height: customStyle.container?.height ?? preset.container.height ?? 0,
    },
    fontSize: customStyle.fontSize ?? preset.fontSize,
    highlightColor: customStyle.highlightColor ?? preset.highlightColor,
    strokeWidth: customStyle.strokeWidth ?? preset.strokeWidth,
    strokeColor: customStyle.strokeColor ?? preset.strokeColor,
    textTransform: customStyle.textTransform ?? preset.textTransform,
    fontFamily: customStyle.fontFamily ?? preset.fontFamily,
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 h-full">
      <h3 className="text-xl font-bold text-gray-800 mb-6">Subtitle Styles</h3>
      <div className="flex mb-6">
        <button
          className={`flex-1 py-2 rounded-l-xl font-semibold text-lg transition-all ${activeTab === 'preset' ? 'bg-[#a8324a] text-white' : 'bg-gray-100 text-gray-700'}`}
          onClick={() => setActiveTab('preset')}
        >
          Preset Style
        </button>
        <button
          className={`flex-1 py-2 rounded-r-xl font-semibold text-lg transition-all ${activeTab === 'custom' ? 'bg-[#a8324a] text-white' : 'bg-gray-100 text-gray-700'}`}
          onClick={() => setActiveTab('custom')}
        >
          Custom Style
        </button>
      </div>
      {activeTab === 'preset' && (
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-gray-700 mb-4">Preset Styles</h4>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(PRESET_STYLES).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setPendingPreset(key as SubtitleStyle)}
                className={`p-3 rounded-xl border-2 transition-all duration-200 text-left ${
                  pendingPreset === key
                    ? 'border-[#a8324a] bg-[#a8324a]/10 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="font-semibold text-sm text-gray-800 mb-1">
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </div>
                <div 
                  className="text-xs font-bold"
                  style={{
                    color: config.highlightColor,
                    WebkitTextStroke: `${Math.min(parseInt(config.strokeWidth), 0.5)}px ${config.strokeColor}`,
                    textTransform: config.textTransform,
                  }}
                >
                  Sample Text
                </div>
              </button>
            ))}
          </div>
          <button
            className="mt-6 w-full py-2 rounded-xl bg-[#a8324a] text-white font-bold text-lg shadow-lg hover:bg-[#8a223a] transition-all"
            onClick={handleApplyPreset}
            disabled={pendingPreset === selectedStyle}
          >
            Apply Preset
          </button>
        </div>
      )}
      {activeTab === 'custom' && (
        <div className="space-y-6">
          {/* Colors */}
          <div className="flex flex-wrap gap-4 w-full">
            <ColorPicker
              label="Text Color"
              value={mergedStyle.highlightColor}
              onChange={(value) => onCustomStyleChange({ ...customStyle, highlightColor: value })}
            />
            <ColorPicker
              label="Stroke Color"
              value={mergedStyle.strokeColor}
              onChange={(value) => onCustomStyleChange({ ...customStyle, strokeColor: value })}
            />
          </div>
          {/* Font Family Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Font Family
            </label>
            <select
              value={mergedStyle.fontFamily || ''}
              onChange={(e) => onCustomStyleChange({ ...customStyle, fontFamily: e.target.value })}
              className="w-full px-3 text-gray-800 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a8324a] focus:border-transparent"
            >
              <option value="">Default</option>
              <option value="Arial, Helvetica, sans-serif">Arial / Helvetica</option>
              <option value="Impact, Charcoal, sans-serif">Impact / Charcoal</option>
              <option value="Courier New, Courier, monospace">Courier New</option>
              <option value="Georgia, serif">Georgia</option>
              <option value="Times New Roman, Times, serif">Times New Roman</option>
              <option value="Verdana, Geneva, sans-serif">Verdana</option>
              <option value="Trebuchet MS, Helvetica, sans-serif">Trebuchet MS</option>
              <option value="Lucida Console, Monaco, monospace">Lucida Console</option>
              <option value="Palatino, Palatino Linotype, serif">Palatino</option>
              <option value="Tahoma, Geneva, sans-serif">Tahoma</option>
              <option value="Arial Black, Gadget, sans-serif">Arial Black</option>
              <option value="Copperplate, Papyrus, fantasy">Copperplate</option>
              <option value="Comic Sans MS, Comic Sans, cursive">Comic Sans MS</option>
              <option value="Gill Sans, Gill Sans MT, Calibri, sans-serif">Gill Sans</option>
              <option value="Brush Script MT, cursive">Brush Script MT</option>
              <option value="Optima, Segoe, Segoe UI, Candara, Calibri, Arial, sans-serif">Optima</option>
              <option value="Franklin Gothic Medium, Arial Narrow, Arial, sans-serif">Franklin Gothic Medium</option>
            </select>
          </div>
          {/* Typography */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Font Size
              </label>
              <input
                type="range"
                min="100"
                max="300"
                value={mergedStyle.fontSize}
                onChange={(e) => onCustomStyleChange({ ...customStyle, fontSize: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer"
              />
              <div className="text-xs text-gray-500 mt-1">{mergedStyle.fontSize}px</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Text Transform
              </label>
              <select
                value={mergedStyle.textTransform}
                onChange={(e) => onCustomStyleChange({ ...customStyle, textTransform: e.target.value as "none" | "uppercase" | "lowercase" | "capitalize" })}
                className="w-full px-3 text-gray-800 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a8324a] focus:border-transparent"
              >
                <option value="none">None</option>
                <option value="uppercase">Uppercase</option>
                <option value="lowercase">Lowercase</option>
                <option value="capitalize">Capitalize</option>
              </select>
            </div>
          </div>
          {/* Stroke */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stroke Width
              </label>
              <input
                type="range"
                min="0"
                max="20"
                value={parseInt(mergedStyle.strokeWidth)}
                onChange={(e) => onCustomStyleChange({ ...customStyle, strokeWidth: `${e.target.value}px` })}
                className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer"
              />
              <div className="text-xs text-gray-500 mt-1">{mergedStyle.strokeWidth}</div>
            </div>
          </div>
          {/* Position */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                X Position (Left)
              </label>
              <input
                type="range"
                min="-1000"
                max="1000"
                value={mergedStyle.container.left}
                onChange={(e) => {
                  const left = parseInt(e.target.value);
                  onCustomStyleChange({
                    ...customStyle,
                    container: {
                      ...(customStyle.container || {}),
                      left,
                      justifyContent: customStyle.container?.justifyContent ?? preset.container.justifyContent ?? 'center',
                      alignItems: customStyle.container?.alignItems ?? preset.container.alignItems ?? 'center',
                    },
                  });
                }}
                className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer"
              />
              <div className="text-xs text-gray-500 mt-1">{mergedStyle.container.left}px</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Y Position (Top)
              </label>
              <input
                type="range"
                min="-1000"
                max="2000"
                value={mergedStyle.container.top}
                onChange={(e) => {
                  const top = parseInt(e.target.value);
                  onCustomStyleChange({
                    ...customStyle,
                    container: {
                      ...(customStyle.container || {}),
                      top,
                      justifyContent: customStyle.container?.justifyContent ?? preset.container.justifyContent ?? 'center',
                      alignItems: customStyle.container?.alignItems ?? preset.container.alignItems ?? 'center',
                    },
                  });
                }}
                className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer"
              />
              <div className="text-xs text-gray-500 mt-1">{mergedStyle.container.top}px</div>
            </div>
          </div>
          <button
            className="mt-6 w-full py-2 rounded-xl bg-[#a8324a] text-white font-bold text-lg shadow-lg hover:bg-[#8a223a] transition-all"
            onClick={onApplyCustomStyle}
          >
            Apply Custom Style
          </button>
        </div>
      )}
    </div>
  );
}; 