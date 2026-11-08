'use client';

import React, { useState } from 'react';
import type { StudentProfile } from '../types/progress';
import { updateStudentProfileAction } from '../actions/sessionActions';

export const VISITOR_PROFILE_STORAGE_KEY = 'aprovacnh_visitor_profile';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentProfile;
  onProfileUpdated?: (updated: Partial<StudentProfile>) => void;
}

const UF_OPTIONS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

export function ProfileModal({
  isOpen,
  onClose,
  profile,
  onProfileUpdated,
}: ProfileModalProps) {
  const [fullName, setFullName] = useState(profile.fullName ?? '');
  const [uf, setUf] = useState(profile.uf ?? 'MG');
  const [targetCategory, setTargetCategory] = useState(profile.targetCategory ?? 'B');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const saveVisitorProfileLocally = (updatedData: Partial<StudentProfile>) => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(
          VISITOR_PROFILE_STORAGE_KEY,
          JSON.stringify(updatedData)
        );
      } catch {
        // Ignora erro de quota do localStorage
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (uf && uf.trim().toUpperCase() === 'BR') {
      setErrorMessage('A sigla "BR" não é permitida como código de UF (D014).');
      return;
    }

    const updatedPayload: Partial<StudentProfile> = {
      fullName: fullName.trim() || 'Estudante Visitante',
      uf: uf || null,
      targetCategory,
    };

    // Se estiver em modo visitante, salva direto no localStorage sem disparar erro de autenticação
    if (profile.id === 'guest') {
      saveVisitorProfileLocally(updatedPayload);
      if (onProfileUpdated) {
        onProfileUpdated(updatedPayload);
      }
      onClose();
      return;
    }

    setIsLoading(true);

    const result = await updateStudentProfileAction({
      fullName,
      uf: uf || null,
      targetCategory,
    });

    setIsLoading(false);

    // Fallback amigável caso a sessão tenha expirado (salva localmente sem bloquear o aluno)
    if (!result.success) {
      if (result.error?.includes('não autenticado')) {
        saveVisitorProfileLocally(updatedPayload);
        if (onProfileUpdated) {
          onProfileUpdated(updatedPayload);
        }
        onClose();
        return;
      }

      setErrorMessage(result.error ?? 'Falha ao atualizar dados de perfil.');
      return;
    }

    if (onProfileUpdated) {
      onProfileUpdated(updatedPayload);
    }

    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-5 animate-in fade-in-0 zoom-in-95"
        tabIndex={-1}
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 id="profile-modal-title" className="text-lg font-bold text-slate-900">
            Ajustar Perfil de Estudo
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar janela de perfil"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <div
              id="profile-error-alert"
              role="alert"
              className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium"
            >
              {errorMessage}
            </div>
          )}

          <div>
            <label htmlFor="modal-name-input" className="block text-xs font-semibold text-slate-700 mb-1">
              Nome de Estudante
            </label>
            <input
              id="modal-name-input"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Seu nome"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="modal-uf-select" className="block text-xs font-semibold text-slate-700 mb-1">
                Estado (UF)
              </label>
              <select
                id="modal-uf-select"
                value={uf}
                onChange={(e) => setUf(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="MG">MG — Minas Gerais (Padrão)</option>
                <option value="">Nacional (SENATRAN)</option>
                {UF_OPTIONS.filter((sigla) => sigla !== 'MG').map((sigla) => (
                  <option key={sigla} value={sigla}>
                    {sigla}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="modal-cat-select" className="block text-xs font-semibold text-slate-700 mb-1">
                Categoria CNH
              </label>
              <select
                id="modal-cat-select"
                value={targetCategory}
                onChange={(e) => setTargetCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="B">B — Carro</option>
                <option value="A">A — Moto</option>
                <option value="AB">AB — Carro e Moto</option>
                <option value="C">C — Carga</option>
                <option value="D">D — Passageiros</option>
                <option value="E">E — Articulados</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50 transition-colors shadow-xs"
            >
              {isLoading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
