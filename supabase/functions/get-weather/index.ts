import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { latitude, longitude } = await req.json();
    
    if (!latitude || !longitude) {
      throw new Error('Latitude and longitude are required');
    }

    // Using OpenWeatherMap API (free tier)
    // You can replace this with any weather API
    const weatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${Deno.env.get("OPENWEATHER_API_KEY")}&units=metric&lang=fr`
    );

    // For demo purposes, return mock data if API fails
    if (!weatherResponse.ok) {
      const mockWeatherData = {
        location: {
          name: "Tunis",
          country: "TN"
        },
        current: {
          temp_c: Math.round(20 + Math.random() * 15), // Random temp between 20-35°C
          condition: {
            text: ["Ensoleillé", "Partiellement nuageux", "Nuageux"][Math.floor(Math.random() * 3)],
            icon: "☀️"
          },
          humidity: Math.round(40 + Math.random() * 40),
          wind_kph: Math.round(5 + Math.random() * 15),
          feelslike_c: Math.round(22 + Math.random() * 12)
        },
        forecast: {
          forecastday: [{
            day: {
              maxtemp_c: Math.round(25 + Math.random() * 10),
              mintemp_c: Math.round(15 + Math.random() * 8)
            }
          }]
        }
      };

      return new Response(
        JSON.stringify(mockWeatherData),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const weatherData = await weatherResponse.json();
    
    // Transform to our expected format
    const transformedData = {
      location: {
        name: weatherData.name || "Tunis",
        country: weatherData.sys?.country || "TN"
      },
      current: {
        temp_c: Math.round(weatherData.main.temp),
        condition: {
          text: weatherData.weather[0].description,
          icon: getWeatherIcon(weatherData.weather[0].icon)
        },
        humidity: weatherData.main.humidity,
        wind_kph: Math.round(weatherData.wind?.speed * 3.6), // Convert m/s to km/h
        feelslike_c: Math.round(weatherData.main.feels_like)
      },
      forecast: {
        forecastday: [{
          day: {
            maxtemp_c: Math.round(weatherData.main.temp_max),
            mintemp_c: Math.round(weatherData.main.temp_min)
          }
        }]
      }
    };

    return new Response(
      JSON.stringify(transformedData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-weather function:', error);
    
    // Return fallback weather data for Tunis
    const fallbackData = {
      location: {
        name: "Tunis",
        country: "TN"
      },
      current: {
        temp_c: 24,
        condition: {
          text: "Ensoleillé",
          icon: "☀️"
        },
        humidity: 65,
        wind_kph: 12,
        feelslike_c: 26
      },
      forecast: {
        forecastday: [{
          day: {
            maxtemp_c: 28,
            mintemp_c: 18
          }
        }]
      }
    };

    return new Response(
      JSON.stringify(fallbackData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function getWeatherIcon(iconCode: string): string {
  const iconMap: { [key: string]: string } = {
    '01d': '☀️', '01n': '🌙',
    '02d': '🌤️', '02n': '☁️',
    '03d': '☁️', '03n': '☁️',
    '04d': '☁️', '04n': '☁️',
    '09d': '🌧️', '09n': '🌧️',
    '10d': '🌦️', '10n': '🌧️',
    '11d': '⛈️', '11n': '⛈️',
    '13d': '❄️', '13n': '❄️',
    '50d': '🌫️', '50n': '🌫️'
  };
  
  return iconMap[iconCode] || '☀️';
}