import adapter from '@sveltejs/adapter-auto';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		runes: ({ filename }) => (filename.includes('node_modules') ? undefined : true)
	},
	kit: {
		// 배포 환경(Vercel/Netlify/Cloudflare 등)에 맞는 어댑터로 교체해도 됩니다.
		adapter: adapter()
	}
};

export default config;
