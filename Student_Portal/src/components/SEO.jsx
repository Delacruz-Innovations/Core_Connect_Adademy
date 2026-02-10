import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, image, url, type = 'website' }) => {
    const siteName = 'Core Connect Academy';
    const fullTitle = title ? `${title} | ${siteName}` : siteName;
    const defaultDescription = 'Bridging the gap between education and industry through hybrid mentorship and apprenticeship programs.';
    const finalDescription = description || defaultDescription;
    const siteUrl = 'https://coreconnect.academy'; // Fallback
    const finalUrl = url ? `${siteUrl}${url}` : siteUrl;
    const finalImage = image || `${siteUrl}/og-image.jpg`;

    return (
        <Helmet>
            {/* Standard metadata tags */}
            <title>{fullTitle}</title>
            <meta name="description" content={finalDescription} />

            {/* OpenGraph tags */}
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={finalDescription} />
            <meta property="og:type" content={type} />
            <meta property="og:url" content={finalUrl} />
            <meta property="og:image" content={finalImage} />
            <meta property="og:site_name" content={siteName} />

            {/* Twitter Card tags */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={finalDescription} />
            <meta name="twitter:image" content={finalImage} />

            {/* Canonical Link */}
            <link rel="canonical" href={finalUrl} />
        </Helmet>
    );
};

export default SEO;
