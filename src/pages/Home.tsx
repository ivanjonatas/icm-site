import React, {useLayoutEffect, useState} from 'react';
import {news, resources} from '../data';

import {
  Icon,
  Link,
  External,
  Action,
  Photo,
  Eyebrow,
  Empty,
  navigate,
} from '../components/ui';

import {
  NewsCard,
  ResourceLink,
} from '../components/content';

export function SearchForm({
  compact = false,
}: {
  compact?: boolean;
}) {
  const [q, setQ] = useState('');

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const query = q.trim();

    navigate(
      '/igrejas' +
        (query ? '?q=' + encodeURIComponent(query) : '')
    );
  }

  const inputId = compact ? 'home-search' : 'find-search';

  return (
    <form
      className={
        'search-form ' +
        (compact ? 'search-compact' : '')
      }
      role="search"
      onSubmit={handleSubmit}
    >
      <label htmlFor={inputId}>
        Em que localidade procura?
      </label>

      <div className="search-input">
        <Icon name="search" />

        <input
          id={inputId}
          type="search"
          value={q}
          onChange={event => setQ(event.target.value)}
          placeholder="Escreva uma localidade, por exemplo, Lisboa"
        />

        <button className="button" type="submit">
          Pesquisar
          <Icon name="arrow" />
        </button>
      </div>
    </form>
  );
}

const visitSteps = [
  {
    title: 'Encontre uma igreja',
    text:
      'Pesquise pela sua localidade e consulte a morada da congregação.',
    href: '/igrejas',
    cta: 'Procurar uma igreja',
  },
  {
    title: 'Escolha o seu horário',
    text:
      'Cada congregação tem a sua programação. Consulte os horários antes de sair de casa.',
    href: '/igrejas',
    cta: 'Consultar horários',
  },
  {
    title: 'Venha conhecer-nos',
    text:
      'Tem alguma dúvida antes da visita? Saiba como encontrar informação e os canais disponíveis.',
    href: '/contactos',
    cta: 'Preparar a visita',
  },
];

export function Home() {
  const [headerHeight, setHeaderHeight] = useState(97);

  useLayoutEffect(() => {
    const header =
      document.querySelector<HTMLElement>('.site-header');

    if (!header) {
      setHeaderHeight(0);
      return;
    }

    function updateHeaderHeight() {
      if (!header) return;

      setHeaderHeight(
        Math.ceil(header.getBoundingClientRect().height)
      );
    }

    updateHeaderHeight();

    const observer = new ResizeObserver(updateHeaderHeight);

    observer.observe(header);
    window.addEventListener('resize', updateHeaderHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateHeaderHeight);
    };
  }, []);

  return (
    <>
      <section
        className="hero"
        style={{
          minHeight: `calc(100svh - ${headerHeight}px)`,
        }}
      >
        <Photo
          name="maanaim"
          alt="Edifício Maanaim de Portugal, sede da Igreja Cristã Maranata em Portugal"
          className="hero-image"
          priority
        />

        <div className="hero-shade" />

        <div className="container hero-content">
          <h1>
            MARANATA
            <br />
            <span>
              O SENHOR JESUS
              <br className="mobile-break" /> VEM!
            </span>
          </h1>

          <p>Anunciando o Evangelho Eterno.</p>

          <div className="hero-actions">
            <Action href="/igrejas">
              Encontre uma igreja mais perto de si
            </Action>
          </div>
        </div>
      </section>

      <section className="section welcome">
        <div className="container welcome-grid">
          <div className="welcome-photo">
            <Photo
              name="esf-caldas"
              alt="Louvor e evangelização nas Caldas da Rainha, em maio de 2026"
            />
          </div>

          <div className="welcome-copy">
            <Eyebrow>Seja muito bem-vindo</Eyebrow>

            <h2>
              A paz do
              <br />
              Senhor Jesus!
            </h2>

            <p className="lead">
              É com alegria que o recebemos.
            </p>

            <p>
              Conheça a Igreja Cristã Maranata, descubra uma
              congregação perto de si e venha partilhar connosco
              um momento de culto e comunhão.
            </p>

            <Link className="text-link" href="/a-igreja">
              Conheça a nossa igreja
              <Icon name="arrow" />
            </Link>
          </div>
        </div>
      </section>

      <section className="section visit">
        <div className="container">
          <div className="section-heading">
            <div>
              <Eyebrow>A sua primeira visita</Eyebrow>
              <h2>Passo a passo.</h2>
            </div>

            <p>
              Encontre o caminho, consulte os horários
              <br className="desktop-break" /> e sinta-se à
              vontade para nos visitar.
            </p>
          </div>

          <div className="visit-steps">
            {visitSteps.map((step, index) => (
              <article key={step.title}>
                <span className="step-number">
                  0{index + 1}
                </span>

                <h3>{step.title}</h3>
                <p>{step.text}</p>

                <Link
                  href={step.href}
                  className="text-link"
                >
                  {step.cta}
                  <Icon name="arrow" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="life-section">
        <div className="life-image">
          <Photo
            name="esf-lisboa"
            alt="Instrumentistas e participantes no ESF em Lisboa"
          />
        </div>

        <div className="life-copy">
          <Eyebrow>Fé vivida em comunidade</Eyebrow>

          <h2>
            A mesma esperança.
            <br />
            Muitas formas
            <br />
            de a partilhar.
          </h2>

          <p>
            O ensino da Palavra, o louvor e a evangelização
            fazem parte da vida da Igreja Cristã Maranata.
          </p>

          <div className="life-links">
            <Link href="/conteudos">
              <Icon name="book" />
              <span>Aprender com a Palavra</span>
              <Icon name="arrow" />
            </Link>

            <External href="https://esf.pt/">
              <Icon name="globe" />
              <span>Partilhar o Evangelho em Portugal</span>
            </External>
          </div>
        </div>
      </section>

      <section className="section agenda-home">
        <div className="container">
          <div className="section-heading">
            <div>
              <Eyebrow>Agenda</Eyebrow>
              <h2>Os próximos encontros.</h2>
            </div>

            <Link className="text-link" href="/agenda">
              Consultar a agenda
              <Icon name="arrow" />
            </Link>
          </div>

          <Empty title="Novos encontros serão anunciados em breve.">
            Acompanhe a agenda para conhecer os próximos
            eventos confirmados em Portugal.
          </Empty>
        </div>
      </section>

      <section className="section news-section">
        <div className="container">
          <div className="section-heading">
            <div>
              <Eyebrow>Notícias · Portugal</Eyebrow>
              <h2>Histórias de fé e comunhão.</h2>
            </div>

            <Link href="/noticias" className="text-link">
              Todas as notícias
              <Icon name="arrow" />
            </Link>
          </div>

          <div className="home-news">
            {news[0] && (
              <NewsCard article={news[0]} featured />
            )}

            <div className="secondary-news">
              {news.slice(1).map(article => (
                <NewsCard
                  article={article}
                  key={article.slug}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section resources-home">
        <div className="container">
          <div className="section-heading">
            <div>
              <Eyebrow>Conteúdos e canais</Eyebrow>
              <h2>A Palavra acompanha-o.</h2>
            </div>

            <Link href="/conteudos" className="text-link">
              Explorar conteúdos
              <Icon name="arrow" />
            </Link>
          </div>

          <div className="resource-grid">
            {resources.slice(0, 3).map(resource => (
              <ResourceLink
                key={resource.id}
                resource={resource}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}