import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getNodeByKey, NodeKey } from "lexical";
import mermaid from "mermaid";
import { useCallback, useEffect, useMemo, useState } from "react";
import { $isMermaidNode } from "./node";

export interface MermaidProps {
  text: string;
  nodeKey: NodeKey;
}
mermaid.initialize({});
export const Mermaid: React.FC<MermaidProps> = ({ text, nodeKey }) => {
  const [mermaidText, setMermaidText] = useState<string>(text);
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [mode, setMode] = useState<"preview" | "edit">("preview");

  useEffect(() => {
    setMermaidText(text);
    renderMermaid();
  }, [text]);

  const lineCount = useMemo(() => mermaidText.split("\n").length, [mermaidText]);

  const [editor] = useLexicalComposerContext();
  const toggleMode = () => {
    setMode(mode === "preview" ? "edit" : "preview");
  };
  useEffect(() => {
    mermaid.contentLoaded();
  }, []);

  const renderMermaid = useCallback(async () => {
    try {
      const mermaidId = `mermaid-${nodeKey}`;
      const isValid = await mermaid.parse(mermaidText);
      if (isValid) {
        editor.update(() => {
          const node = $getNodeByKey(nodeKey);
          if (text !== mermaidText && $isMermaidNode(node)) {
            node.setText(mermaidText);
          }
        });
        const { svg } = await mermaid.render(mermaidId, mermaidText);
        setSvg(svg);
        setError("");
      } else {
        setSvg("");
        setError("Invalid Mermaid text");
      }
    } catch (error) {
      setSvg("");
      setError("Invalid Mermaid text");
    }
  }, [mermaidText, text]);

  useEffect(() => {
    renderMermaid();
  }, [mermaidText]);

  return (
    <div className=" relative group bg-secondary" style={{ minHeight: "200px" }}>
      <button
        className="absolute top-2 right-2 hover:bg-secondary px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => {
          toggleMode();
        }}
      >
        {mode === "preview" ? "Edit" : "Preview"}
      </button>
      {mode === "edit" && (
        <textarea
          rows={lineCount}
          className="w-full p-1"
          value={mermaidText}
          onChange={(e) => {
            setMermaidText(e.target.value);
          }}
        ></textarea>
      )}
      {error && <div className="text-red-500">{error}</div>}
      {mode === "preview" && (
        <div
          className="p-2 flex items-center justify-center"
          dangerouslySetInnerHTML={{
            __html: svg,
          }}
        />
      )}
    </div>
  );
};
