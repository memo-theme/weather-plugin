export default {
	async scheduled(controller, env, ctx) {
		ctx.waitUntil(updateWeather(env));
	},
};

async function updateWeather(env) {
	const lat = 43.33003301715253;
	const lon = 145.5976092292395;
	const apiKey = await env.OPENWEATHERMAP_APIKEY.get();

	if (!apiKey) {
		console.error('OPENWEATHERMAP_APIKEY secret not configured');
		return;
	}

	const weatherUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,daily,alerts&appid=${apiKey}&units=metric&lang=ja`;

	try {
		const weatherResponse = await fetch(weatherUrl);
		if (!weatherResponse.ok) {
			const errorText = await weatherResponse.text();
			console.error('Failed to fetch weather data', errorText);
			return;
		}

		const weatherData = await weatherResponse.json();

		await env.R2_BUCKET.put('weather.json', JSON.stringify(weatherData));
		console.log('Successfully fetched and stored weather data.');
	} catch (e) {
		if (e instanceof Error) {
			console.error('Failed to fetch weather data', e.message);
		} else {
			console.error('Failed to fetch weather data', 'Unknown error');
		}
	}
}
