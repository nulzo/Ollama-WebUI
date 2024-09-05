import { Helmet, HelmetData } from 'react-helmet-async';

type HelmetProps = {
  title?: string;
  description?: string;
};

const helmetData = new HelmetData({});

export const Head = ({ title = '', description = '' }: HelmetProps = {}) => {
  return (
    <Helmet
      helmetData={helmetData}
      title={title ? `${title} | Bulletproof React` : undefined}
      defaultTitle="Bulletproof React"
    >
      <meta name="description" content={description} />
    </Helmet>
  );
};
