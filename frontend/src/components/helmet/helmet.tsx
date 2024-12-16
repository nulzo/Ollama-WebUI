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
      title={title ? `CringeGPT | ${title}` : undefined}
      defaultTitle="CringeGPT"
    >
      <meta name="description" content={description} />
    </Helmet>
  );
};
