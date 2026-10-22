import React from 'react';

export default function AgeGateModal({ isOpen, onConfirm }) {
  const [underage, setUnderage] = React.useState(false);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#121518]/95 backdrop-blur-md"
    >
      <div className="w-full max-w-md bg-[#F4F1EA] text-[#121518] p-10 sm:p-12 shadow-2xl">
        <div className="mb-6 flex justify-center">
          <img
            src="/logos/logo-claro-transparente.png"
            alt="Gralha Brewing Co."
            className="w-36 h-36 object-contain"
          />
        </div>

        {underage ? (
          <div className="py-4 border-t border-[#121518]/15 text-center">
            <p className="font-serif italic text-lg text-[#121518] mb-2">
              Acesso restrito a maiores de 18 anos.
            </p>
            <p className="text-xs text-[#121518]/70 leading-relaxed">
              A Gralha Brewing Co. incentiva o consumo responsável.
            </p>
          </div>
        ) : (
          <>
            <h2
              id="age-gate-title"
              className="font-serif text-2xl sm:text-3xl font-normal tracking-tight text-[#121518] mb-3 text-center"
            >
              Você tem mais de 18 anos?
            </h2>
            <p className="text-xs text-[#121518]/70 text-center leading-relaxed mb-8">
              Confirme sua idade para explorar a história e o universo da Gralha Brewing Co.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={onConfirm}
                className="py-3.5 px-4 bg-[#121518] text-[#F4F1EA] font-mono text-xs uppercase tracking-[0.16em] hover:bg-[#D88128] hover:text-[#121518] transition-colors"
              >
                Sim, tenho +18
              </button>
              <button
                type="button"
                onClick={() => setUnderage(true)}
                className="py-3.5 px-4 border border-[#121518]/25 text-[#121518] font-mono text-xs uppercase tracking-[0.16em] hover:border-[#121518] transition-colors"
              >
                Não
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
