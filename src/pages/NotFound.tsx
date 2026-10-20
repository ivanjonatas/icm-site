import React, {useEffect,useRef,useState} from 'react';
import {Eyebrow,Action} from '../components/ui';
export function NotFound(){return <section className="section not-found container"><Eyebrow>Erro 404</Eyebrow><h1>O caminho não<br/>termina aqui.</h1><p>Não encontrámos esta página. Pode regressar ao início ou procurar uma igreja perto de si.</p><div className="hero-actions"><Action href="/">Voltar ao início</Action><Action href="/igrejas" secondary>Encontrar uma igreja</Action></div></section>;}
