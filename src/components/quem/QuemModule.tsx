import React from 'react';
import { CtfStudent } from '../ctf/CtfStudent';

/** Quem sou eu?: ambiente próprio, com sala da turma criada pelo professor (token, ranking e telão). */
export const QuemModule: React.FC = () => (
  <div className="pt-2">
    <CtfStudent modulo="quem" />
  </div>
);
