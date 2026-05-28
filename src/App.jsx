import { useState, useRef } from "react";

const CATEGORY_OPTIONS = ["BOLSA", "CINTO", "CHAPÉU", "CARTEIRA", "MOCHILA", "OUTRO ACESSÓRIO"];
const BAG_TYPES = ["BOLSA DE COURO", "BOLSA SINTÉTICA", "CLUTCH", "ESTRUTURADA", "POCHETE", "MOCHILA", "TRANSVERSAL", "TOTE", "SACO", "SHOPPING"];
const MATERIAL_OPTIONS = ["COURO LEGÍTIMO", "COURO SINTÉTICO", "NYLON", "LONA", "CAMURÇA", "VELUDO", "PALHA", "TECIDO", "OUTRO"];

const BELT_SIZES = {
  P: "99 cm", M: "104 cm", G: "109 cm", GG: "114 cm", XGG: "130 cm"
};

export default function App() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [bagTypes, setBagTypes] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [customMaterial, setCustomMaterial] = useState("");
  const [obs, setObs] = useState("");
  const [image, setImage] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [altura, setAltura] = useState("");
  const [largura, setLargura] = useState("");
  const [profundidade, setProfundidade] = useState("");
  const [cintoSizes, setCintoSizes] = useState({ P: false, M: false, G: false, GG: false, XGG: false });
  const [result, setResult] = useState("");
  const [seoResult, setSeoResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedSeo, setCopiedSeo] = useState("");
  const [error, setError] = useState("");
  const fileRef = useRef();

  const isCinto = category === "CINTO";

  const toggleMaterial = (mat) => {
    setMaterials(prev =>
      prev.includes(mat) ? prev.filter(m => m !== mat) : [...prev, mat]
    );
  };

  const toggleBagType = (type) => {
    setBagTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const finalMaterials = () => {
    const list = [...materials];
    if (list.includes("OUTRO") && customMaterial.trim()) {
      const idx = list.indexOf("OUTRO");
      list[idx] = customMaterial.trim().toUpperCase();
    }
    return list.filter(m => m !== "OUTRO" || customMaterial.trim());
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImagePreview(ev.target.result);
      setImageBase64(ev.target.result.split(",")[1]);
    };
    reader.readAsDataURL(file);
  };

  const toggleCintoSize = (size) => {
    setCintoSizes(prev => ({ ...prev, [size]: !prev[size] }));
  };

  const buildDimensionsText = () => {
    if (isCinto) {
      return `TAMANHOS DISPONÍVEIS (padrão para todos os cintos): P (99 cm), M (104 cm), G (109 cm), GG (114 cm), XGG (130 cm). A descrição vale para todos os tamanhos.`;
    }
    const parts = [];
    if (altura) parts.push(`ALTURA - ${altura} CM`);
    if (largura) parts.push(`LARGURA - ${largura} CM`);
    if (profundidade) parts.push(`PROFUNDIDADE - ${profundidade} CM`);
    return parts.length > 0 ? `DIMENSÕES: ${parts.join(" - ")}` : "";
  };

  const handleGenerate = async () => {
    if (!title.trim()) { setError("Por favor, informe o título do produto."); return; }
    if (!category) { setError("Por favor, selecione a categoria."); return; }
    const mats = finalMaterials();
    if (mats.length === 0) { setError("Por favor, selecione pelo menos um material."); return; }
    setError("");
    setLoading(true);
    setResult("");

    const dimensionsText = buildDimensionsText();
    const materialsText = mats.join(", ");
    const bagTypesText = bagTypes.length > 0 ? `\nTIPOS DE BOLSA: ${bagTypes.join(", ")}` : "";
    // For the last line, use first non-OUTRO material as "premium" label
    const premiumMaterial = mats[0];
    const obsText = obs.trim() ? `\nOBSERVAÇÕES ADICIONAIS: ${obs.trim()}` : "";

    const prompt = `Você é especialista em copywriting para e-commerce de moda e acessórios premium. Crie uma descrição de produto completa com SEO otimizado para a seguinte peça.

DADOS DO PRODUTO:
TÍTULO: ${title}
CATEGORIA: ${category}
MATERIAL(IS): ${materialsText}${bagTypesText}
${dimensionsText}${obsText}

REGRAS OBRIGATÓRIAS:
1. NÃO use frases introdutórias como "Apresentamos", "Conheça" ou similares. Comece DIRETO com o artigo da categoria: "A bolsa...", "O chapéu...", "O cinto...", "A carteira...", "A mochila...", etc.
2. Mencione APENAS os materiais que foram informados acima. Não invente nem suponha outros materiais.
3. NÃO enfatize cores específicas. O produto tem várias variações de cor.
4. Analise as características da peça com criatividade. Cada produto é único, por isso crie uma descrição original e diferenciada, destacando os pontos fortes reais desta peça específica.
5. Use palavras-chave SEO naturalmente ao longo do texto.
6. NUNCA use o caractere travessão (—) em NENHUMA parte da descrição. Em vez disso, use ponto final, vírgula ou reescreva a frase sem ele.
7. NUNCA use asteriscos (*) em nenhuma parte da descrição. Títulos de seção como "Destaques do Produto:", "Dimensões:" e "Funcionalidade:" devem aparecer em texto simples, sem nenhuma formatação markdown.
ESTRUTURA OBRIGATÓRIA (use exatamente estes títulos e formatação):

[Linha de abertura]: ${title}
IMPORTANTE: a primeira linha é SOMENTE o título, exatamente como fornecido. Sem negrito, sem travessão, sem frase adicional, sem emojis, sem pontuação extra.

[Parágrafo]: 2-3 frases iniciando com "A bolsa..." / "O chapéu..." / "O cinto..." etc., descrevendo o produto com sofisticação.

Destaques do Produto:
• [destaque baseado nos materiais informados e características visuais]
• [design / modelagem]
• [acabamento / detalhes]
• [durabilidade / qualidade]
• [diferencial único desta peça]

Dimensões:
${isCinto ? "• Tamanhos: [listar os tamanhos selecionados com suas medidas]" : "• Altura: [valor]\n• Largura: [valor]\n• Profundidade: [valor]"}

Funcionalidade:
• [uso principal]
• [ocasião ideal]
• [capacidade / praticidade]

PRODUTO NOVO | ${premiumMaterial.toUpperCase()} PREMIUM | ENVIO RÁPIDO | ATACADO FACILITADO | FRETE FIXO 19,99 | PARCELAMENTO EM ATÉ 3X SEM JUROS | BOLSAS E ACESSÓRIOS NOVOS TODOS OS DIAS | EMBALAGEM SEGURA

${imageBase64 ? "IMPORTANTE: Analise cuidadosamente a imagem enviada e adapte TODOS os destaques e descrições com base nas características visuais reais do produto — formato, costuras, alças, fivelas, bolsos, texturas e outros detalhes visíveis." : ""}
${obs.trim() ? `IMPORTANTE: Incorpore as observações adicionais fornecidas de forma natural na descrição.` : ""}

Retorne APENAS a descrição formatada, sem comentários ou explicações adicionais.`;

    try {
      const messages = imageBase64
        ? [{
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: image.type || "image/jpeg", data: imageBase64 } },
              { type: "text", text: prompt }
            ]
          }]
        : [{ role: "user", content: prompt }];

      const seoPrompt = `Você é especialista em SEO para e-commerce de moda e acessórios premium. Gere dados de SEO de altíssima performance para o seguinte produto.

PRODUTO: ${title}
CATEGORIA: ${category}
MATERIAL(IS): ${materialsText}${bagTypesText}
${dimensionsText}${obsText}

Retorne APENAS um JSON válido, sem markdown, sem explicações, exatamente neste formato:
{
  "titulo": "título SEO com entre 30 e 65 caracteres, usando vírgula como separador (NUNCA o símbolo |), incluindo palavras-chave de alto volume",
  "palavras_chave": "palavra1, palavra2, palavra3, ... (mínimo 15 palavras-chave relevantes separadas por vírgula)",
  "descricao": "descrição SEO entre 120 e 250 caracteres, persuasiva e com palavras-chave naturais. NUNCA use o símbolo - (hífen ou traço) em nenhuma parte da descrição"
}`;

      const [descResp, seoResp] = await Promise.all([
        fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, messages })
        }),
        fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 500,
            messages: [{ role: "user", content: seoPrompt }]
          })
        })
      ]);

      const descData = await descResp.json();
      const seoData = await seoResp.json();

      const descText = descData.content?.map(b => b.text || "").join("") || "";
      setResult(descText.trim());

      try {
        const seoRaw = seoData.content?.map(b => b.text || "").join("") || "";
        const seoClean = seoRaw.replace(/```json|```/g, "").trim();
        const seoJson = JSON.parse(seoClean);
        setSeoResult(seoJson);
      } catch {
        setSeoResult(null);
      }

    } catch (err) {
      setError("Erro ao gerar descrição. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const copyText = (text, setter) => {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setter(true);
      setTimeout(() => setter(false), 2000);
    } catch {
      navigator.clipboard.writeText(text).then(() => {
        setter(true);
        setTimeout(() => setter(false), 2000);
      });
    }
  };

  const handleCopy = () => copyText(result, setCopied);

  const handleClear = () => {
    setTitle(""); setCategory(""); setBagTypes([]); setMaterials([]); setCustomMaterial(""); setObs("");
    setImage(null); setImageBase64(null); setImagePreview(null);
    setAltura(""); setLargura(""); setProfundidade("");
    setCintoSizes({ P: false, M: false, G: false, GG: false, XGG: false });
    setResult(""); setSeoResult(null); setError("");
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div style={{ minHeight: "100vh", background: "#000000", fontFamily: "'Georgia', 'Times New Roman', serif", color: "#ffffff", padding: "0" }}>
      {/* Header */}
      <div style={{ background: "#000000", borderBottom: "1px solid #2a2a2a", padding: "24px 40px", display: "flex", alignItems: "center", gap: "16px", boxShadow: "0 2px 12px rgba(255,255,255,0.04)" }}>
        <div style={{ fontSize: "32px" }}>👜</div>
        <div>
          <div style={{ fontSize: "22px", fontWeight: "bold", color: "#ffffff", letterSpacing: "2px", textTransform: "uppercase" }}>Gerador de Descrições</div>
          <div style={{ fontSize: "12px", color: "#666666", letterSpacing: "3px", textTransform: "uppercase" }}>E-commerce Premium · Couro & Acessórios</div>
        </div>
      </div>

      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "40px 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>

        {/* LEFT COLUMN */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Image */}
          <div style={cardStyle}>
            <label style={labelStyle}>📷 Imagem do Produto</label>
            <div onClick={() => fileRef.current.click()} style={{
              border: "2px dashed #333333", borderRadius: "8px", padding: "20px", textAlign: "center", cursor: "pointer",
              background: imagePreview ? "transparent" : "rgba(255,255,255,0.02)", transition: "all 0.2s",
              minHeight: "120px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden"
            }}>
              {imagePreview
                ? <img src={imagePreview} alt="preview" style={{ maxHeight: "140px", maxWidth: "100%", borderRadius: "6px", objectFit: "contain" }} />
                : <div>
                    <div style={{ fontSize: "32px", marginBottom: "8px" }}>📁</div>
                    <div style={{ color: "#aaaaaa", fontSize: "13px" }}>Clique para enviar imagem</div>
                    <div style={{ color: "#555555", fontSize: "11px", marginTop: "4px" }}>JPG, PNG, WEBP</div>
                  </div>
              }
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} style={{ display: "none" }} />
            {imagePreview && (
              <button onClick={() => { setImage(null); setImageBase64(null); setImagePreview(null); if (fileRef.current) fileRef.current.value = ""; }}
                style={{ ...smallBtnStyle, marginTop: "8px", background: "rgba(200,50,30,0.12)", border: "1px solid #552020", color: "#ff7777" }}>
                ✕ Remover imagem
              </button>
            )}
          </div>

          {/* Title */}
          <div style={cardStyle}>
            <label style={labelStyle}>📝 Título do Produto *</label>
            <input value={title} onChange={e => setTitle(e.target.value)}
              placeholder="Cole aqui o título do produto"
              style={inputStyle} />
          </div>

          {/* Category */}
          <div style={cardStyle}>
            <label style={labelStyle}>🏷 Categoria *</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {CATEGORY_OPTIONS.map(cat => (
                <button key={cat} onClick={() => setCategory(cat)} style={{
                  padding: "7px 14px", borderRadius: "20px", fontSize: "12px", cursor: "pointer",
                  border: category === cat ? "1px solid #ffffff" : "1px solid #333333",
                  background: category === cat ? "#ffffff" : "rgba(255,255,255,0.03)",
                  color: category === cat ? "#000000" : "#aaaaaa",
                  fontFamily: "inherit", fontWeight: category === cat ? "bold" : "normal",
                  transition: "all 0.15s"
                }}>{cat}</button>
              ))}
            </div>
          </div>

          {/* Bag Types */}
          <div style={cardStyle}>
            <label style={labelStyle}>👜 Tipo de Bolsa <span style={{ color: "#555555", fontWeight: "normal", textTransform: "none", letterSpacing: 0 }}>(selecione um ou mais)</span></label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {BAG_TYPES.map(type => (
                <button key={type} onClick={() => toggleBagType(type)} style={{
                  padding: "7px 14px", borderRadius: "20px", fontSize: "12px", cursor: "pointer",
                  border: bagTypes.includes(type) ? "1px solid #ffffff" : "1px solid #333333",
                  background: bagTypes.includes(type) ? "#ffffff" : "rgba(255,255,255,0.03)",
                  color: bagTypes.includes(type) ? "#000000" : "#aaaaaa",
                  fontFamily: "inherit", fontWeight: bagTypes.includes(type) ? "bold" : "normal",
                  transition: "all 0.15s"
                }}>{type}</button>
              ))}
            </div>
          </div>

          {/* Material — multi-select */}
          <div style={cardStyle}>
            <label style={labelStyle}>🧵 Material * <span style={{ color: "#555555", fontWeight: "normal", textTransform: "none", letterSpacing: 0 }}>(selecione um ou mais)</span></label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "10px" }}>
              {MATERIAL_OPTIONS.map(mat => (
                <button key={mat} onClick={() => toggleMaterial(mat)} style={{
                  padding: "7px 14px", borderRadius: "20px", fontSize: "12px", cursor: "pointer",
                  border: materials.includes(mat) ? "1px solid #ffffff" : "1px solid #333333",
                  background: materials.includes(mat) ? "#ffffff" : "rgba(255,255,255,0.03)",
                  color: materials.includes(mat) ? "#000000" : "#aaaaaa",
                  fontFamily: "inherit", fontWeight: materials.includes(mat) ? "bold" : "normal",
                  transition: "all 0.15s"
                }}>{mat}</button>
              ))}
            </div>
            {materials.includes("OUTRO") && (
              <input value={customMaterial} onChange={e => setCustomMaterial(e.target.value)}
                placeholder="Descreva o material..." style={{ ...inputStyle, marginTop: "4px" }} />
            )}
          </div>

          {/* Dimensions */}
          <div style={cardStyle}>
            <label style={labelStyle}>📏 Dimensões</label>
            {isCinto ? (
              <div>
                <div style={{ fontSize: "12px", color: "#777777", marginBottom: "12px" }}>Tamanhos padrão aplicados automaticamente:</div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {Object.entries(BELT_SIZES).map(([size, cm]) => (
                    <div key={size} style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #333333", background: "rgba(255,255,255,0.04)", textAlign: "center", minWidth: "60px" }}>
                      <div style={{ fontWeight: "bold", fontSize: "14px", color: "#ffffff" }}>{size}</div>
                      <div style={{ fontSize: "10px", color: "#777777", marginTop: "2px" }}>{cm}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: "11px", color: "#555555", marginTop: "10px" }}>✓ Todos os tamanhos incluídos automaticamente na descrição</div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                {[["Altura (cm)", altura, setAltura], ["Largura (cm)", largura, setLargura], ["Profundidade (cm)", profundidade, setProfundidade]].map(([lbl, val, setter]) => (
                  <div key={lbl}>
                    <div style={{ fontSize: "11px", color: "#777777", marginBottom: "4px" }}>{lbl}</div>
                    <input value={val} onChange={e => setter(e.target.value)} placeholder="0,0"
                      style={{ ...inputStyle, padding: "8px 10px", fontSize: "14px", textAlign: "center" }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Observations */}
          <div style={cardStyle}>
            <label style={labelStyle}>💬 Alguma observação?</label>
            <textarea value={obs} onChange={e => setObs(e.target.value)}
              placeholder="Ex: possui bolso interno com zíper, alça removível, fecho magnético dourado..."
              rows={3}
              style={{ ...inputStyle, resize: "vertical", lineHeight: "1.6" }} />
          </div>

          {/* Error */}
          {error && (
            <div style={{ background: "rgba(200,50,30,0.12)", border: "1px solid #552020", borderRadius: "8px", padding: "12px 16px", color: "#ff8888", fontSize: "13px" }}>
              ⚠ {error}
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: "flex", gap: "12px" }}>
            <button onClick={handleGenerate} disabled={loading} style={{
              flex: 1, padding: "14px", borderRadius: "8px", cursor: loading ? "not-allowed" : "pointer",
              background: loading ? "#1a1a1a" : "#ffffff",
              border: "none", color: loading ? "#555555" : "#000000",
              fontFamily: "inherit", fontSize: "14px", fontWeight: "bold",
              letterSpacing: "1px", textTransform: "uppercase",
              transition: "all 0.2s",
              boxShadow: loading ? "none" : "0 4px 20px rgba(255,255,255,0.12)"
            }}>
              {loading ? "⏳ Gerando..." : "✨ Gerar Descrição"}
            </button>
            <button onClick={handleClear} style={{
              padding: "14px 20px", borderRadius: "8px", cursor: "pointer",
              background: "transparent", border: "1px solid #333333",
              color: "#777777", fontFamily: "inherit", fontSize: "13px",
              transition: "all 0.2s"
            }}>🗑 Limpar</button>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ ...cardStyle, flex: 1, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <label style={labelStyle}>📄 Descrição Gerada</label>
              {result && (
                <button onClick={handleCopy} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "5px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontFamily: "inherit", background: copied ? "rgba(60,200,80,0.15)" : "rgba(255,255,255,0.08)", border: copied ? "1px solid #40cc60" : "1px solid #555555", color: copied ? "#40cc60" : "#cccccc", transition: "all 0.2s" }}>
                  {copied ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>}
                  {copied ? "Copiado!" : "Copiar"}
                </button>
              )}
            </div>
            {loading ? (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px", color: "#666666" }}>
                <div style={{ fontSize: "40px", animation: "spin 1.5s linear infinite" }}>⚙️</div>
                <div style={{ fontSize: "13px", letterSpacing: "1px" }}>Analisando produto e criando descrição...</div>
              </div>
            ) : result ? (
              <div style={{
                flex: 1, background: "#0a0a0a", borderRadius: "8px", padding: "20px",
                border: "1px solid #2a2a2a", fontSize: "13px", lineHeight: "1.85",
                color: "#ffffff", whiteSpace: "pre-wrap", overflowY: "auto",
                maxHeight: "680px", fontFamily: "'Georgia', serif"
              }}>
                {result}
              </div>
            ) : (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#333333", gap: "12px", minHeight: "300px" }}>
                <div style={{ fontSize: "48px", opacity: 0.25 }}>📝</div>
                <div style={{ fontSize: "13px", textAlign: "center", lineHeight: "1.6" }}>
                  Preencha os dados do produto<br />e clique em <strong style={{ color: "#666666" }}>Gerar Descrição</strong>
                </div>
              </div>
            )}
          </div>

          {/* SEO Box */}
          <div style={{ ...cardStyle, display: "flex", flexDirection: "column", gap: "14px" }}>
            <label style={labelStyle}>🔍 SEO Gerado</label>
            {loading ? (
              <div style={{ textAlign: "center", color: "#555555", fontSize: "13px", padding: "20px 0" }}>
                <div style={{ fontSize: "24px", marginBottom: "8px" }}>⏳</div>
                Gerando SEO...
              </div>
            ) : seoResult ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {/* Título SEO */}
                <div style={{ background: "#0a0a0a", borderRadius: "8px", padding: "14px", border: "1px solid #2a2a2a" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <div style={{ fontSize: "11px", color: "#888888", letterSpacing: "1px", textTransform: "uppercase" }}>Título SEO</div>
                    <button onClick={() => { copyText(seoResult.titulo, (v) => setCopiedSeo(v ? "titulo" : "")); }} title="Copiar" style={{ display: "flex", alignItems: "center", gap: "5px", padding: "5px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontFamily: "inherit", background: copiedSeo === "titulo" ? "rgba(60,200,80,0.15)" : "rgba(255,255,255,0.08)", border: copiedSeo === "titulo" ? "1px solid #40cc60" : "1px solid #555555", color: copiedSeo === "titulo" ? "#40cc60" : "#cccccc", transition: "all 0.2s" }}>
                      {copiedSeo === "titulo" ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>}
                      {copiedSeo === "titulo" ? "Copiado!" : "Copiar"}
                    </button>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                    <div style={{ fontSize: "13px", color: "#ffffff", lineHeight: "1.6", flex: 1 }}>{seoResult.titulo}</div>
                    <div style={{ fontSize: "11px", color: seoResult.titulo.length < 30 || seoResult.titulo.length > 65 ? "#ff7777" : "#40cc60", whiteSpace: "nowrap", marginTop: "2px" }}>{seoResult.titulo.length}/65</div>
                  </div>
                </div>
                {/* Palavras-chave */}
                <div style={{ background: "#0a0a0a", borderRadius: "8px", padding: "14px", border: "1px solid #2a2a2a" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <div style={{ fontSize: "11px", color: "#888888", letterSpacing: "1px", textTransform: "uppercase" }}>Palavras-chave</div>
                    <button onClick={() => { copyText(seoResult.palavras_chave, (v) => setCopiedSeo(v ? "kw" : "")); }} title="Copiar" style={{ display: "flex", alignItems: "center", gap: "5px", padding: "5px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontFamily: "inherit", background: copiedSeo === "kw" ? "rgba(60,200,80,0.15)" : "rgba(255,255,255,0.08)", border: copiedSeo === "kw" ? "1px solid #40cc60" : "1px solid #555555", color: copiedSeo === "kw" ? "#40cc60" : "#cccccc", transition: "all 0.2s" }}>
                      {copiedSeo === "kw" ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>}
                      {copiedSeo === "kw" ? "Copiado!" : "Copiar"}
                    </button>
                  </div>
                  <div style={{ fontSize: "13px", color: "#ffffff", lineHeight: "1.8" }}>{seoResult.palavras_chave}</div>
                </div>
                {/* Descrição SEO */}
                <div style={{ background: "#0a0a0a", borderRadius: "8px", padding: "14px", border: "1px solid #2a2a2a" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <div style={{ fontSize: "11px", color: "#888888", letterSpacing: "1px", textTransform: "uppercase" }}>Descrição SEO</div>
                    <button onClick={() => { copyText(seoResult.descricao, (v) => setCopiedSeo(v ? "desc" : "")); }} title="Copiar" style={{ display: "flex", alignItems: "center", gap: "5px", padding: "5px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontFamily: "inherit", background: copiedSeo === "desc" ? "rgba(60,200,80,0.15)" : "rgba(255,255,255,0.08)", border: copiedSeo === "desc" ? "1px solid #40cc60" : "1px solid #555555", color: copiedSeo === "desc" ? "#40cc60" : "#cccccc", transition: "all 0.2s" }}>
                      {copiedSeo === "desc" ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>}
                      {copiedSeo === "desc" ? "Copiado!" : "Copiar"}
                    </button>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                    <div style={{ fontSize: "13px", color: "#ffffff", lineHeight: "1.6", flex: 1 }}>{seoResult.descricao}</div>
                    <div style={{ fontSize: "11px", color: seoResult.descricao.length < 120 || seoResult.descricao.length > 250 ? "#ff7777" : "#40cc60", whiteSpace: "nowrap", marginTop: "2px" }}>{seoResult.descricao.length}/250</div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center", color: "#333333", fontSize: "13px", padding: "20px 0" }}>
                <div style={{ fontSize: "32px", marginBottom: "8px", opacity: 0.3 }}>🔍</div>
                O SEO será gerado junto com a descrição
              </div>
            )}
          </div>

          {/* Tips */}
          <div style={{ background: "#0d0d0d", border: "1px solid #222222", borderRadius: "8px", padding: "16px" }}>
            <div style={{ fontSize: "11px", color: "#666666", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "10px" }}>💡 Dicas de uso</div>
            <div style={{ fontSize: "12px", color: "#555555", lineHeight: "1.8" }}>
              • Envie a imagem para descrições muito mais precisas<br />
              • Selecione todos os materiais presentes na peça<br />
              • Use o campo de observações para detalhes únicos<br />
              • Copie e cole diretamente na plataforma de venda
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input:focus, textarea:focus { outline: none !important; border-color: #ffffff !important; box-shadow: 0 0 0 2px rgba(255,255,255,0.08) !important; }
        button:hover:not(:disabled) { filter: brightness(1.15); transform: translateY(-1px); }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #000000; }
        ::-webkit-scrollbar-thumb { background: #333333; border-radius: 3px; }
      `}</style>
    </div>
  );
}

const cardStyle = {
  background: "#111111",
  border: "1px solid #222222",
  borderRadius: "10px",
  padding: "18px",
};

const labelStyle = {
  display: "block",
  fontSize: "11px",
  letterSpacing: "1.5px",
  textTransform: "uppercase",
  color: "#777777",
  marginBottom: "12px",
  fontFamily: "'Georgia', serif"
};

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  background: "#1a1a1a",
  border: "1px solid #2e2e2e",
  borderRadius: "6px",
  color: "#ffffff",
  fontFamily: "'Georgia', serif",
  fontSize: "13px",
  boxSizing: "border-box",
  transition: "border-color 0.2s"
};

const smallBtnStyle = {
  padding: "6px 14px",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "12px",
  fontFamily: "'Georgia', serif",
  letterSpacing: "0.5px",
  transition: "all 0.2s"
};
