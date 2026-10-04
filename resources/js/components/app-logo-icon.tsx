import { type SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
            <path d="M3 6a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v2.76a.6.6 0 0 1-.38.56 3.2 3.2 0 0 0 0 5.36.6.6 0 0 1 .38.56V18a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-2.76a.6.6 0 0 1 .38-.56 3.2 3.2 0 0 0 0-5.36A.6.6 0 0 1 3 8.76Zm6 .9a.6.6 0 0 0-1.2 0v1.4a.6.6 0 0 0 1.2 0Zm0 4.4a.6.6 0 0 0-1.2 0v1.4a.6.6 0 0 0 1.2 0Zm0 4.4a.6.6 0 0 0-1.2 0v1.4a.6.6 0 0 0 1.2 0Z" />
        </svg>
    );
}
