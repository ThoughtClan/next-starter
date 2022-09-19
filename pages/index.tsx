import Head from "next/head";
import Image from "next/image";
import { useState } from "react";

import { DefaultApi } from "../api/api";
import CountriesRequests from "../api/requests/countries";
import useApi from "../hooks/useApi";
import styles from "../styles/Home.module.css";
import Country from "../types/country";

type HomeProps = {
  countries: Array<Country>;
};

function Home({ countries: countriesProp }: HomeProps) {
  const [countries, setCountries] = useState<Array<Country>>(countriesProp);
  const api = useApi();

  const reloadCountries = async () => {
    try {
      const request = CountriesRequests.getAllCountries();
      const response = await api.performRequest<Array<Country>>(request);

      setCountries(response);
    } catch (e) {
      setCountries([]);
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>NextJS</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to <a href="https://nextjs.org">Next.js!</a>
        </h1>

        <p className={styles.description}>
          Get started by editing{" "}
          <code className={styles.code}>pages/index.tsx</code>
        </p>

        <div className={styles.grid}>
          <a href="https://nextjs.org/docs" className={styles.card}>
            <h2>Documentation &rarr;</h2>
            <p>Find in-depth information about Next.js features and API.</p>
          </a>

          <a href="https://nextjs.org/learn" className={styles.card}>
            <h2>Learn &rarr;</h2>
            <p>Learn about Next.js in an interactive course with quizzes!</p>
          </a>

          <a
            href="https://github.com/vercel/next.js/tree/canary/examples"
            className={styles.card}
          >
            <h2>Examples &rarr;</h2>
            <p>Discover and deploy boilerplate example Next.js projects.</p>
          </a>

          <a
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            className={styles.card}
          >
            <h2>Deploy &rarr;</h2>
            <p>
              Instantly deploy your Next.js site to a public URL with Vercel.
            </p>
          </a>
        </div>

        <ul className={styles.list}>
          {countries.map((c) => (
            <li key={c.name.official}>{c.name.official}</li>
          ))}
        </ul>

        <button type="button" onClick={reloadCountries}>
          load all countries
        </button>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{" "}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  );
}

export default Home;

export async function getServerSideProps() {
  try {
    const request = CountriesRequests.getAllCountries();
    const response = await DefaultApi.performRequest<Array<Country>>(request);

    return {
      props: {
        countries: response.sort(() => 0.5 - Math.random()).slice(0, 5),
      },
    };
  } catch (e) {
    console.error("[index] failed to perform request for SSR", e);

    return { props: { countries: [] } };
  }
}
