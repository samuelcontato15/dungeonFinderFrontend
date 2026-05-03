// src/models/types.ts

export interface Jogo {
  id: string;
  titulo: string;
  imagem: any;
  categoria: "GAMES" | "RPG_DE_MESA" | "NOVIDADES";
}

export interface Usuario {
  id: string;           
  username: string;
  email: string;
  avatar?: string;     
  nivel: number;
  xp: number;
  guildaId?: string;
  amigos?: string[];   
  criadoEm?: Date;
}

export interface Guilda {
  id: string;
  nome: string;
  descricao: string;
  jogo: string;        
  donoId: string;       
  membros?: string[];   
  membrosAtivos: number;
  avatar?: string;
  criadaEm?: Date;
}

export interface Amizade {
  id: string;
  usuarioId: string;
  amigoId: string;
  status: "pendente" | "aceita" | "recusada";
  criadaEm?: Date;
}

export interface Mensagem {
  id: string;
  autorId: string;
  conteudo: string;
  criadaEm: Date;
  guildaId?: string;    
  destinatarioId?: string; 
}