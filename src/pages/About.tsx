import React from 'react';
import {institutionalUrl} from '../data';
import {
  PageIntro,
  Photo,
  Eyebrow,
  External,
  Link,
  Icon,
} from '../components/ui';
import {Invite} from '../components/layout';

const faith = [
  [
    'Deus Pai, Filho e Espírito Santo',
    'Cremos num só Deus, eterno e todo-poderoso, que se revela como Pai, Filho e Espírito Santo.',
    'Mateus 28:19',
  ],
  [
    'Jesus Cristo, o Salvador',
    'A nossa salvação está na graça de Deus, mediante a fé no Senhor Jesus, que morreu e ressuscitou.',
    'Efésios 2:8–9',
  ],
  [
    'A Palavra de Deus',
    'A Bíblia, no Antigo e no Novo Testamento, é a nossa regra de fé e prática.',
    '2 Timóteo 3:16–17',
  ],
  [
    'A direção do Espírito Santo',
    'Cremos no batismo com o Espírito Santo e nos dons espirituais para a edificação da Igreja.',
    '1 Coríntios 12:7',
  ],
  [
    'A Igreja, Corpo de Cristo',
    'Unidos em comunhão, servimos ao Senhor Jesus, o Cabeça da Igreja.',
    'Efésios 4:15–16',
  ],
  [
    'A volta do Senhor Jesus',
    'Aguardamos o arrebatamento da Igreja, perseverando na fé e anunciando esta esperança.',
    '1 Tessalonicenses 4:16–17',
  ],
];

const life = [
  {
    icon: 'book' as const,
    title: 'Ensino da Palavra',
    text:
      'A Escola Bíblica Dominical é um tempo para estudar as Escrituras e aprender em comunhão. O ensino da Palavra acompanha a nossa caminhada com o Senhor.',
  },
  {
    icon: 'music' as const,
    title: 'Louvor e adoração',
    text:
      'Nos cultos, reunimo-nos para glorificar a Deus. Pelo louvor, expressamos gratidão e anunciamos a salvação em Jesus Cristo.',
  },
  {
    icon: 'globe' as const,
    title: 'Evangelização',
    text:
      'Partilhamos a mensagem do Evangelho. Em Portugal, o trabalho Evangelho Sem Fronteiras leva esta mensagem às ruas através da evangelização e do louvor.',
  },
];

const styles = `
.icm-about {
  --about-gap: clamp(28px, 5vw, 76px);
}

.icm-about section[id] {
  scroll-margin-top: 150px;
}

.icm-about .about-index {
  border-block: 1px solid var(--line);
  background: #fff;
}

.icm-about .about-index .container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 30px;
  padding-block: 18px;
}

.icm-about .about-index a {
  padding: 7px 0;
  font-size: .87rem;
  font-weight: 700;
  color: var(--muted);
}

.icm-about .about-index a:hover {
  color: var(--red);
}

.icm-about .about-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: var(--about-gap);
}

.icm-about .about-text p:not(.lead) {
  color: var(--muted);
  font-size: 1.06rem;
}

.icm-about .about-text h2 {
  max-width: 650px;
}

.icm-about .about-photo {
  min-width: 0;
  background: #f1f3f5;
  border: 1px solid var(--line);
  border-radius: 8px;
  overflow: hidden;
}

.icm-about .about-photo img {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: auto;
  object-fit: contain;
}

.icm-about .about-photo figcaption {
  margin: 0;
  padding: 15px 20px;
  font-size: .82rem;
  line-height: 1.6;
  background: #fff;
}

.icm-about .about-heading {
  max-width: 760px;
  margin-bottom: 40px;
}

.icm-about .about-heading > p {
  color: var(--muted);
  font-size: 1.08rem;
}

.icm-about .about-timeline {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 36px;
  margin-top: 48px;
}

.icm-about .about-timeline article {
  border-top: 2px solid var(--red);
  padding-top: 24px;
}

.icm-about .about-timeline span {
  display: block;
  font-family: var(--head);
  font-size: 2rem;
  color: var(--red);
  margin-bottom: 14px;
}

.icm-about .about-timeline h3 {
  font-size: 1.3rem;
}

.icm-about .about-timeline p {
  color: var(--muted);
  margin-bottom: 0;
}

.icm-about .about-message {
  position: relative;
  overflow: hidden;
  background: #d00000;
  color: #fff;
  padding-block: 80px;
  .icm-about .about-message p,
  .icm-about .about-message .about-reference {
  color: #fff;
}
}

.icm-about .about-message::after {
  content: '';
  position: absolute;
  width: 420px;
  height: 420px;
  border: 1px solid #ffffff18;
  border-radius: 50%;
  right: -160px;
  top: -150px;
  pointer-events: none;
}

.icm-about .about-message .container {
  position: relative;
  z-index: 1;
  max-width: 1050px;
}

.icm-about .about-message h2 {
  font-size: clamp(2.7rem, 6vw, 5rem);
  color: white;
  max-width: 900px;
}

.icm-about .about-message p {
  font-size: 1.15rem;
  color: #dde5eb;
  max-width: 740px;
}

.icm-about .about-message .about-reference {
  display: block;
  font-size: .83rem;
  letter-spacing: .08em;
  color: #e9b5bd;
}

.icm-about .about-faith {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
}

.icm-about .about-faith article {
  background: white;
  border: 1px solid var(--line);
  border-radius: 6px;
  padding: 30px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.icm-about .about-faith .about-number {
  color: var(--red);
  font-size: .76rem;
  font-weight: 700;
  letter-spacing: .13em;
  margin-bottom: 22px;
}

.icm-about .about-faith h3 {
  font-size: 1.35rem;
  line-height: 1.3;
}

.icm-about .about-faith p {
  color: var(--muted);
  font-size: 1rem;
}

.icm-about .about-faith small {
  color: var(--red);
  margin-top: auto;
  font-size: .8rem;
  padding-top: 10px;
}

.icm-about .about-faith-link {
  margin-top: 28px;
}

.icm-about .about-life {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 36px;
  margin-top: 44px;
}

.icm-about .about-life article {
  border-top: 1px solid var(--line);
  padding-top: 28px;
}

.icm-about .about-life article > .icon {
  width: 30px;
  height: 30px;
  color: var(--red);
  margin-bottom: 20px;
}

.icm-about .about-life p {
  color: var(--muted);
}

.icm-about .about-gallery {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-top: 48px;
  align-items: start;
}

.icm-about .about-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 28px;
}

.icm-about .about-questions {
  display: grid;
  grid-template-columns: .85fr 1.15fr;
  gap: var(--about-gap);
}

.icm-about .about-questions details {
  border-bottom: 1px solid var(--line);
  padding-block: 20px;
}

.icm-about .about-questions details:first-child {
  border-top: 1px solid var(--line);
}

.icm-about .about-questions summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  cursor: pointer;
  list-style: none;
  font-weight: 700;
  color: var(--navy);
  font-size: 1.06rem;
}

.icm-about .about-questions summary::-webkit-details-marker {
  display: none;
}

.icm-about .about-questions summary .icon {
  transition: transform .2s;
}

.icm-about .about-questions details[open] summary .icon {
  transform: rotate(180deg);
}

.icm-about .about-questions details p {
  margin: 18px 0 0;
  color: var(--muted);
}

.icm-about .about-sources {
  border-top: 1px solid var(--line);
  padding-block: 24px;
  color: var(--muted);
  font-size: .83rem;
}

.icm-about .about-sources .container {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 24px;
}

.icm-about .about-sources .text-link {
  font-size: .83rem;
}

@media (max-width: 1000px) {
  .icm-about .about-faith {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .icm-about .about-split {
    gap: 35px;
  }

  .icm-about .about-life {
    gap: 24px;
  }
}

html:has(.icm-about) {
  scroll-behavior: smooth;
}

@media (prefers-reduced-motion: reduce) {
  html:has(.icm-about) {
    scroll-behavior: auto;
  }
}

@media (max-width: 760px) {
  .icm-about .about-split,
  .icm-about .about-questions,
  .icm-about .about-timeline,
  .icm-about .about-life {
    grid-template-columns: 1fr;
  }

  .icm-about .about-gallery {
    grid-template-columns: 1fr;
  }

  .icm-about .about-split {
    gap: 34px;
  }

  .icm-about .about-timeline {
    gap: 28px;
  }

  .icm-about .about-index .container {
    gap: 4px 20px;
  }

  .icm-about .about-message {
    padding-block: 58px;
  }

  .icm-about .about-life {
    gap: 12px;
  }

  .icm-about .about-heading {
    margin-bottom: 28px;
  }
}

@media (max-width: 480px) {
  .icm-about .about-faith {
    grid-template-columns: 1fr;
  }

  .icm-about .about-faith article {
    padding: 25px;
  }

  .icm-about .about-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .icm-about .about-photo figcaption {
    padding: 13px 16px;
  }

  .icm-about .about-index a {
    font-size: .8rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .icm-about * {
    transition: none !important;
    scroll-behavior: auto !important;
  }
}
`;

type ChurchPhotoProps = {
  name: string;
  alt: string;
  caption: string;
  priority?: boolean;
};

function ChurchPhoto({
  name,
  alt,
  caption,
  priority = false,
}: ChurchPhotoProps) {
  return (
    <figure className="about-photo">
      <Photo name={name} alt={alt} priority={priority} />
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

export function About() {
  return (
    <div className="icm-about">
      <style>{styles}</style>

      <PageIntro
        label="A Igreja"
        title="Uma esperança, um só Senhor, uma fé."
      >
        Conheça a Igreja Cristã Maranata, a nossa mensagem e a vida
        em comunhão em Portugal.
      </PageIntro>

      <nav className="about-index" aria-label="Nesta página">
        <div className="container">
          <a href="#quem-somos">Quem somos</a>
          <a href="#historia">A nossa história</a>
          <a href="#maranata">Maranata</a>
          <a href="#fe">A nossa fé</a>
          <a href="#vida">Vida da igreja</a>
          <a href="#portugal">Em Portugal</a>
        </div>
      </nav>

      <section
        className="section"
        id="quem-somos"
        aria-labelledby="about-who"
      >
        <div className="container about-split">
          <div className="about-text">
            <Eyebrow>Quem somos</Eyebrow>

            <h2 id="about-who">
              Jesus Cristo é o nosso fundamento.
            </h2>

            <p className="lead">
              Somos uma igreja cristã e pentecostal. O centro da
              nossa fé é o Senhor Jesus.
            </p>

            <p>
              Entendemos a nossa caminhada à luz das Escrituras,
              procurando ouvir e obedecer à direção do Espírito
              Santo.
            </p>

            <p>
              Em Portugal, reunimo-nos para orar, ouvir a Palavra
              e louvar ao Senhor. A comunhão aproxima irmãos de
              diferentes idades e lugares.
            </p>

            <Link href="/igrejas" className="text-link">
              Encontre uma igreja perto de si
              <Icon name="arrow" />
            </Link>
          </div>

          <ChurchPhoto
            name="esf-lisboa"
            alt="Registo do Evangelho Sem Fronteiras em Lisboa"
            caption="Evangelho Sem Fronteiras · Lisboa"
            priority
          />
        </div>
      </section>

      <section
        className="section muted-section"
        id="historia"
        aria-labelledby="about-history"
      >
        <div className="container">
          <div className="about-heading">
            <Eyebrow>A nossa história</Eyebrow>

            <h2 id="about-history">
              Uma caminhada de fé e serviço.
            </h2>

            <p>
              A história institucional tem origem no Brasil.
              A sua mensagem atravessou fronteiras e é também
              anunciada em Portugal.
            </p>
          </div>

          <div className="about-timeline">
            <article>
              <span>1968</span>
              <h3>Origem institucional</h3>

              <p>
                A Igreja Cristã Maranata foi constituída em janeiro,
                em Vila Velha, no Espírito Santo, Brasil.
              </p>
            </article>

            <article>
              <span>1980</span>
              <h3>O nome Maranata</h3>

              <p>
                Em janeiro, a Obra passou a usar o nome Igreja
                Cristã Maranata, ligado à mensagem da volta de Jesus.
              </p>
            </article>

            <article>
              <span>Portugal</span>
              <h3>A mesma esperança</h3>

              <p>
                Conheça as congregações, as suas moradas e os
                horários dos cultos no nosso diretório.
              </p>

              <Link href="/igrejas" className="text-link">
                Consultar igrejas
                <Icon name="arrow" />
              </Link>
            </article>
          </div>
        </div>
      </section>

      <section
        className="about-message"
        id="maranata"
        aria-labelledby="about-maranatha"
      >
        <div className="container">
          <Eyebrow light>A nossa mensagem</Eyebrow>

          <h2 id="about-maranatha">
            Maranata.
            <br />
            O Senhor Jesus vem!
          </h2>

          <p>
            Mais do que um nome, Maranata expressa a esperança que
            anunciamos: Jesus voltará. Esta expectativa convida-nos
            à vigilância e à fidelidade ao Senhor.
          </p>

          <span className="about-reference">
            1 Coríntios 16:22 · Apocalipse 22:20
          </span>
        </div>
      </section>

      <section
        className="section muted-section"
        id="fe"
        aria-labelledby="about-faith"
      >
        <div className="container">
          <div className="about-heading">
            <Eyebrow>Em que cremos</Eyebrow>

            <h2 id="about-faith">
              Uma fé firmada nas Escrituras.
            </h2>
          </div>

          <div className="about-faith">
            {faith.map(([title, text, reference], index) => (
              <article key={title}>
                <span className="about-number">
                  0{index + 1}
                </span>

                <h3>{title}</h3>
                <p>{text}</p>
                <small>{reference}</small>
              </article>
            ))}
          </div>

          <div className="about-faith-link">
            <External
              href={institutionalUrl + '/declaracao-de-fe/'}
              className="text-link"
            >
              Ler a Declaração de Fé completa
            </External>
          </div>
        </div>
      </section>

      <section
        className="section"
        id="vida"
        aria-labelledby="about-life"
      >
        <div className="container">
          <div className="about-split">
            <ChurchPhoto
              name="maanaim"
              alt="Registo do Maanaim de Portugal"
              caption="Maanaim de Portugal"
            />

            <div className="about-text">
              <Eyebrow>A vida da igreja</Eyebrow>

              <h2 id="about-life">
                Servir ao Senhor em comunhão.
              </h2>

              <p className="lead">
                A fé é vivida no culto e na caminhada diária.
              </p>

              <p>
                A oração, a Palavra e o cuidado uns pelos outros
                fazem parte desta vida em comunhão. Crianças,
                adolescentes, jovens e adultos encontram lugar
                para aprender e participar.
              </p>

              <p>
                O ministério é voluntário. O serviço é prestado
                ao Senhor, sem exaltação de pessoas.
              </p>
            </div>
          </div>

          <div className="about-life">
            {life.map(item => (
              <article key={item.title}>
                <Icon name={item.icon} />
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>

          <div className="about-gallery">
            <ChurchPhoto
              name="esf-caldas"
              alt="Registo do Evangelho Sem Fronteiras nas Caldas da Rainha"
              caption="Evangelho Sem Fronteiras · Caldas da Rainha"
            />

            <ChurchPhoto
              name="esf-maia"
              alt="Registo do Evangelho Sem Fronteiras na Maia"
              caption="Evangelho Sem Fronteiras · Maia"
            />
          </div>
        </div>
      </section>

      <section
        className="section muted-section"
        id="portugal"
        aria-labelledby="about-portugal"
      >
        <div className="container about-split">
          <div className="about-text">
            <Eyebrow>A Igreja em Portugal</Eyebrow>

            <h2 id="about-portugal">
              Uma igreja perto de si.
            </h2>

            <p className="lead">
              Será bem-vindo para estar connosco num culto.
            </p>

            <p>
              No diretório, pode consultar a morada e os horários
              de cada congregação. Se vai visitar-nos pela primeira
              vez, escolha a igreja mais próxima.
            </p>

            <div className="about-actions">
              <Link href="/igrejas" className="button">
                Encontrar uma igreja
                <Icon name="pin" />
              </Link>

              <Link
                href="/contactos"
                className="button button-secondary"
              >
                Entrar em contacto
                <Icon name="arrow" />
              </Link>
            </div>
          </div>

          <ChurchPhoto
            name="esf-setubal"
            alt="Registo do Evangelho Sem Fronteiras em Setúbal"
            caption="Evangelho Sem Fronteiras · Setúbal"
          />
        </div>
      </section>

      <section
        className="section"
        aria-labelledby="about-visit"
      >
        <div className="container about-questions">
          <div>
            <Eyebrow>A sua primeira visita</Eyebrow>

            <h2 id="about-visit">
              Venha conhecer-nos.
            </h2>

            <p>
              Algumas informações para preparar a sua visita.
            </p>
          </div>

          <div>
            <details>
              <summary>
                Posso participar num culto?
                <Icon name="chevron" />
              </summary>

              <p>
                Sim. Será bem-vindo para estar connosco.
                Consulte a morada e os horários da congregação
                que pretende visitar.
              </p>
            </details>

            <details>
              <summary>
                Onde encontro os horários?
                <Icon name="chevron" />
              </summary>

              <p>
                Na página “Igrejas em Portugal”, abra os horários
                no cartão de cada igreja. Quando disponíveis,
                os perfis locais de Instagram permitem acompanhar
                as informações da congregação.
              </p>
            </details>

            <details>
              <summary>
                Onde posso conhecer melhor a nossa fé?
                <Icon name="chevron" />
              </summary>

              <p>
                A Declaração de Fé apresenta os fundamentos
                doutrinários e as referências bíblicas.
                Pode consultá-la através da ligação nesta página.
              </p>
            </details>
          </div>
        </div>
      </section>

      <div className="about-sources">
        <div className="container">
          <span>
            Conheça mais sobre a igreja no portal institucionai oficial da ICM:
          </span>

          <External
            href={institutionalUrl + '/quem-somos/'}
            className="text-link"
          >
            História da ICM
          </External>

        </div>
      </div>

      <Invite />
    </div>
  );
}