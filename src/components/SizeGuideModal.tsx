import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Ruler } from "lucide-react";

export default function SizeGuideModal() {
  return (
    <Dialog>
      <DialogTrigger>
        <div className="text-[10px] uppercase tracking-widest text-orange-400 hover:text-orange-300 underline underline-offset-4 flex items-center gap-1 font-mono transition-colors cursor-pointer">
          <Ruler className="w-3.5 h-3.5" />
          Tabela de Medidas (Guia de Tamanhos)
        </div>
      </DialogTrigger>
      <DialogContent className="bg-[#0A0A0A] border border-white/10 text-white max-w-2xl p-6 sm:p-8">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-xl font-serif italic uppercase text-white flex items-center gap-2">
            <Ruler className="w-5 h-5 text-orange-400" />
            Guia de Tamanhos & Caimento
          </DialogTitle>
          <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">
            Compare com uma peça do seu guarda-roupa para o ajuste perfeito.
          </p>
        </DialogHeader>

        <div className="space-y-6">
          <div className="border border-white/10 overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-white/5 border-b border-white/10 text-[10px] uppercase tracking-widest text-white/50">
                <tr>
                  <th className="p-3 text-white">Tamanho</th>
                  <th className="p-3 text-white">Altura (cm)</th>
                  <th className="p-3 text-white">Largura (cm)</th>
                  <th className="p-3 text-white">Manga (cm)</th>
                  <th className="p-3 text-white">Recomendado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/80">
                <tr>
                  <td className="p-3 font-bold text-orange-400">P</td>
                  <td className="p-3">68 - 70 cm</td>
                  <td className="p-3">50 - 52 cm</td>
                  <td className="p-3">20 cm</td>
                  <td className="p-3 text-white/50">1,60m - 1,70m | 55-65kg</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-orange-400">M</td>
                  <td className="p-3">71 - 73 cm</td>
                  <td className="p-3">53 - 55 cm</td>
                  <td className="p-3">21 cm</td>
                  <td className="p-3 text-white/50">1,70m - 1,78m | 65-78kg</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-orange-400">G</td>
                  <td className="p-3">74 - 76 cm</td>
                  <td className="p-3">56 - 58 cm</td>
                  <td className="p-3">22 cm</td>
                  <td className="p-3 text-white/50">1,78m - 1,85m | 78-88kg</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-orange-400">GG</td>
                  <td className="p-3">77 - 79 cm</td>
                  <td className="p-3">59 - 61 cm</td>
                  <td className="p-3">23 cm</td>
                  <td className="p-3 text-white/50">1,85m - 1,92m | 88-100kg</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-orange-400">XG / 38-46</td>
                  <td className="p-3">80 - 82 cm</td>
                  <td className="p-3">62 - 64 cm</td>
                  <td className="p-3">24 cm</td>
                  <td className="p-3 text-white/50">Acima de 1,90m | 100kg+</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-white/[0.02] border border-white/5 p-4 text-[10px] text-white/50 uppercase tracking-wider leading-relaxed">
            💡 <strong>Dica de Caimento:</strong> Nossas camisas e jaquetas possuem modelagem Streetwear Oversized / Regular Fit. Se prefere um caimento mais justo, selecione um tamanho menor.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
