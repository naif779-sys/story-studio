import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
      const body = await req.json();
          const { text, model_id, voice_id, apiKey, voice_settings } = body;

              const key = apiKey || process.env.ELEVENLABS_API_KEY || '';
                  const selectedVoiceId = voice_id || 'JBFqnCBsd6RMkjVDRZzb';
                      const selectedModelId = model_id || 'eleven_v3';

                          const response = await fetch(
                                `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}`,
                                      {
                                              method: 'POST',
                                                      headers: {
                                                                'Content-Type': 'application/json',
                                                                          'xi-api-key': key,
                                                                                  },
                                                                                          body: JSON.stringify({
                                                                                                    text,
                                                                                                              model_id: selectedModelId,
                                                                                                                        voice_settings: voice_settings || {
                                                                                                                                    stability: 0.5,
                                                                                                                                              },
                                                                                                                                                      }),
                                                                                                                                                            }
                                                                                                                                                                );

                                                                                                                                                                    if (!response.ok) {
                                                                                                                                                                          const errorText = await response.text();
                                                                                                                                                                                return NextResponse.json({ error: errorText }, { status: response.status });
                                                                                                                                                                                    }

                                                                                                                                                                                        const audioArrayBuffer = await response.arrayBuffer();
                                                                                                                                                                                            return new NextResponse(audioArrayBuffer, {
                                                                                                                                                                                                  headers: {
                                                                                                                                                                                                          'Content-Type': 'audio/mpeg',
                                                                                                                                                                                                                },
                                                                                                                                                                                                                    });
                                                                                                                                                                                                                      } catch (error) {
                                                                                                                                                                                                                          return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
                                                                                                                                                                                                                            }
                                                                                                                                                                                                                            }
                                                                                                                                                                                                                            