'use client'
import React from 'react'
import { TerminalCard } from '@/components/ui/terminal-card'
import { BookOpen, ExternalLink, ShieldCheck, Layers, AlertTriangle } from 'lucide-react'

const ACADEMIC_PAPERS = [
  {
    id: '[1]',
    domain: 'NLP / SMS Phishing',
    citation: 'Al Saidat, M. R., Yerima, S. Y., & Shaalan, K. (2024). Advancements of SMS Smishing Detection: A Comprehensive Survey of NLP and ML Techniques. Procedia Computer Science, 244, 248–259.',
    doi: '10.1016/j.procs.2024.10.198',
    url: 'https://doi.org/10.1016/j.procs.2024.10.198',
    application: 'Combines message NLP signals with URL typosquatting & Shannon entropy checks in /api/analyze.',
  },
  {
    id: '[2]',
    domain: 'NLP / URL Reputation',
    citation: 'Prajapati, P. et al. (2024). Smishing: A SMS Phishing Detection Using Various Machine Learning Algorithms. Springer ICCIS 2023, LNNS vol. 968.',
    doi: '10.1007/978-981-97-2079-8_7',
    url: 'https://doi.org/10.1007/978-981-97-2079-8_7',
    application: 'Integrates VirusTotal v3, Google Safe Browsing, Abuse.ch URLhaus, and OpenPhish URL checks into /nlp.',
  },
  {
    id: '[3]',
    domain: 'Smishing Benchmark',
    citation: 'Mishra, S., & Soni, D. (2023). DSmishSMS — A system to detect smishing SMS. Neural Computing and Applications, 35(7).',
    doi: '10.1007/s00521-021-06305-y',
    url: 'https://doi.org/10.1007/s00521-021-06305-y',
    application: 'Methodology benchmark for evaluating precision/recall on labeled SMS lures.',
  },
  {
    id: '[4]',
    domain: 'Deepfake XAI',
    citation: 'Kaur, A., & Sharma, S. (2026). An Explainable Deep Learning Framework for Robust Deepfake Detection in Video Streams. Atlantis Press BEDAIML 2026.',
    doi: 'BEDAIML-2026',
    url: 'https://huggingface.co/honi05/deepfake-detection',
    application: 'Justifies Grad-CAM facial region saliency attribution for BSA 2023 §63 courtroom admissibility.',
  },
  {
    id: '[5]',
    domain: 'Visual Attribution',
    citation: 'Selvaraju, R. R. et al. (2017). Grad-CAM: Visual Explanations from Deep Networks via Gradient-Based Localization. IEEE ICCV 2017, 618–626.',
    doi: '10.1109/ICCV.2017.74',
    url: 'https://doi.org/10.1109/ICCV.2017.74',
    application: 'Core Grad-CAM heatmap generation in deepfake-xai-engine/src/gradcam.py.',
  },
  {
    id: '[6]',
    domain: 'Cross-Generator Shift',
    citation: 'Keerthana, & Rajam, (2026). Explainability-guided local–global fusion for video deepfake detection. Signal, Image and Video Processing, 20.',
    doi: '10.1007/s11760-026-05658-y',
    url: 'https://doi.org/10.1007/s11760-026-05658-y',
    application: 'Motivates CGFD & FADI evaluation matrices under unseen generator distribution shift.',
  },
  {
    id: '[7]',
    domain: 'Incident Playbooks',
    citation: 'Seiler, A. (2022). How to Build and Use an Incident Response Playbook Effectively. SANS Institute White Paper.',
    doi: 'SANS-PICERL-2022',
    url: 'https://www.sans.org/',
    application: '6-phase PICERL lifecycle implemented in /cyber-ir & SYSTEM_PROMPTS.PLAYBOOK.',
  },
  {
    id: '[8]',
    domain: 'LLM Playbook SOAR',
    citation: 'Kremer, R. et al. (2023). IC-SECURE: Intelligent System for Assisting Security Experts in Generating Playbooks for Automated Incident Response.',
    doi: 'arXiv:2311.03825',
    url: 'https://arxiv.org/abs/2311.03825',
    application: 'Stateless AI-assisted playbook & FIR synthesis via BharatCode AI Harness.',
  },
  {
    id: '[9]',
    domain: 'Indian Criminal Law',
    citation: 'IJRAS (2025). Digital Criminal Justice: Evaluating the Digital Reforms Introduced under BNS and BNSS.',
    doi: 'BNS-BNSS-2025',
    url: 'https://cybercrime.gov.in',
    application: 'Legal basis for e-FIR generation (/incident, /cyber-ir) and BSA 2023 §63 SHA-256 certificates.',
  },
  {
    id: '[10]',
    domain: 'Cyber Statute Mapping',
    citation: 'IJALR (2026). Cyber Stalking in the Digital Age: Assessing the Effectiveness of BNS 2023 and IT Act 2000.',
    doi: 'BNS-ITACT-2026',
    url: 'https://www.indiacode.nic.in',
    application: 'Statutory mapping to BNS 318(4), 319(2), and IT Act 66/66C/66D.',
  },
]

const OPEN_SOURCE_STACK = [
  {
    name: 'Horizon-Labs/phishing-scam-detector-base',
    category: 'HuggingFace NLP',
    license: 'Apache-2.0',
    url: 'https://huggingface.co/Horizon-Labs/phishing-scam-detector-base',
    role: 'Multilingual SMS/email fraud classifier (ONNX browser-ready variant available).',
  },
  {
    name: 'telecomsxchange/OpenTextShield',
    category: 'HuggingFace NLP',
    license: 'BERT Carrier Model',
    url: 'https://huggingface.co/telecomsxchange/OpenTextShield',
    role: 'Low-latency multilingual SMS ham/spam/phishing classification reference.',
  },
  {
    name: 'honi05/deepfake-detection & mertkayacs/xdfdet',
    category: 'HuggingFace XAI',
    license: 'EfficientNet-B4',
    url: 'https://huggingface.co/honi05/deepfake-detection',
    role: 'Wrapped in deepfake-xai-engine/server.py alongside Grad-CAM facial zone attribution.',
  },
  {
    name: 'ishal1410/deepfake-detection-faceforensics',
    category: 'GitHub XAI',
    license: 'Open Source',
    url: 'https://github.com/ishal1410/deepfake-detection-faceforensics',
    role: 'EfficientNet-B0 + MTCNN + Grad-CAM FaceForensics++ / Celeb-DF reference architecture.',
  },
  {
    name: 'Abuse.ch URLhaus & OpenPhish',
    category: 'Live Threat Feeds',
    license: 'Free Public Feed',
    url: 'https://urlhaus.abuse.ch/',
    role: 'Integrated live inside /api/analyze alongside VirusTotal v3 and Google Safe Browsing.',
  },
  {
    name: 'CISA Shareable SOAR Workflows',
    category: 'SOAR Playbooks',
    license: 'Public Domain (US Govt)',
    url: 'https://github.com/cisagov/shareable-soar-workflows',
    role: 'Procedural incident containment baselines adapted for CERT-In & SANS PICERL.',
  },
]

export default function ResearchPage() {
  return (
    <div className="space-y-6">
      <div className="p-4 sm:p-6 rounded-xl bg-white border border-[#E0DDD5] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857] text-xs font-semibold">
              Research & Sources
            </span>
            <span className="text-[11px] font-mono text-[#5C645E]">10 Academic Citations · Open Standards</span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#1C201D] tracking-tight flex items-center gap-2.5">
            <BookOpen className="text-[#059669] shrink-0" size={26} />
            <span>Academic Grounding &amp; Open-Source Stack</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#444B46] leading-relaxed">
            Peer-reviewed cybersecurity literature, statutory Indian legal references (BNS 2023, BSA 2023, DPDP Act 2023), and open-source models integrated across TRINETRA.
          </p>
        </div>
      </div>

      <div className="p-3.5 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-amber-800 text-xs flex items-start sm:items-center gap-2.5">
        <AlertTriangle size={15} className="text-[#D97706] shrink-0 mt-0.5 sm:mt-0" />
        <span>
          <strong>Honest Scope &amp; Limitations:</strong> Pure cryptographic operations (SHA-256, k-anonymity, Shannon entropy) are deterministic. AI phishing and deepfake classification outputs are probabilistic indications — verify manually before legal or enforcement action.
        </span>
      </div>

      <TerminalCard title="Peer-Reviewed Literature & Legal References" label="10 Citations" labelColor="cyan" noPadding>
        <div className="overflow-x-auto text-xs">
          <table className="w-full">
            <thead className="bg-slate-100 text-[#5C645E] font-mono border-b border-[#E0DDD5]">
              <tr>
                <th className="text-left p-3.5">REF</th>
                <th className="text-left p-3.5">DOMAIN</th>
                <th className="text-left p-3.5">CITATION &amp; DOI</th>
                <th className="text-left p-3.5">TRINETRA INTEGRATION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0DDD5]">
              {ACADEMIC_PAPERS.map(paper => (
                <tr key={paper.id} className="hover:bg-slate-50">
                  <td className="p-3.5 font-mono font-bold text-[#047857] align-top">{paper.id}</td>
                  <td className="p-3.5 font-semibold text-[#1C201D] whitespace-nowrap align-top">{paper.domain}</td>
                  <td className="p-3.5 text-[#444B46] leading-relaxed align-top max-w-md">
                    <p>{paper.citation}</p>
                    <a
                      href={paper.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-mono text-[#059669] hover:text-[#047857] mt-1"
                    >
                      <span>{paper.doi}</span>
                      <ExternalLink size={11} />
                    </a>
                  </td>
                  <td className="p-3.5 text-[#5C645E] align-top max-w-sm">{paper.application}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TerminalCard>

      <TerminalCard title="Open-Source Models, Feeds & SOAR Catalog" label="OSS STACK" labelColor="green">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {OPEN_SOURCE_STACK.map(item => (
            <a
              key={item.name}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-xl bg-slate-50 hover:bg-slate-50 border border-[#E0DDD5] hover:border-[#A7F3D0] transition-all space-y-2 block group"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]">
                  {item.category}
                </span>
                <ExternalLink size={13} className="text-slate-500 group-hover:text-[#1C201D] shrink-0" />
              </div>
              <p className="font-mono font-bold text-[#1C201D] break-words">{item.name}</p>
              <p className="text-[#5C645E] leading-relaxed">{item.role}</p>
              <div className="text-[10px] font-mono text-[#15803D] flex items-center gap-1 pt-1">
                <ShieldCheck size={12} />
                <span>{item.license}</span>
              </div>
            </a>
          ))}
        </div>
      </TerminalCard>

      <div className="p-4 rounded-2xl glass-card flex flex-wrap items-center justify-between gap-3 text-xs text-[#444B46]">
        <div className="flex items-center gap-2">
          <Layers size={15} className="text-[#059669]" />
          <span>Full technical architecture &amp; security guardrails documented in <code>DOCS.md</code> and <code>README.md</code>.</span>
        </div>
      </div>
    </div>
  )
}