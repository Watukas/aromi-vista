import React from "react";
import "./ScaleInput.css"; // Assuming you include your styles in this file.

function ScaleInput({value, onChange} : {value?: number, onChange: (newValue?: number) => void}) {
  const pc = (((value ?? 0) - 0.5) / (3 - 0.5)) * 100 + "%";
  const style = {
    background: `linear-gradient(to right,
      transparent 0 ${pc},
      #ffffff ${pc} 100%),
      linear-gradient(to right, #f2ceff, #de26ff)`
  }
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.currentTarget.value));
  };

  return (
    <div style={{position:"relative", width:100, height:"40px"}}>
      <input className="slider" type="range" style={style}
        min="0.5" max="3" step="0.1"
        onContextMenu={e => { e.preventDefault(); onChange(undefined) }}
        value={value ?? 0} onInput={handleInput}
      />
      <div style={{pointerEvents:"none", position:"absolute", display:"flex", top: 0, width:"100%", height:"100%", textAlign:"center", justifyContent:"center", alignItems:"center"}}>
        <span style={{
          fontFamily: value ? "Bebas Neue" : "monospace",
          color: value ? "#000" : "#666", fontSize: 16, width:"100%"
        }}>{value ? `${Math.round(value! * 100.0)}%` : "> scale <"}</span>
      </div>
    </div>
  );
};

export default ScaleInput;