import wave
import math
import struct
import random

SAMPLE_RATE = 44100
DURATION = 30 # seconds
FREQ_1 = 65.41 # C2
FREQ_2 = 98.00 # G2
FREQ_3 = 130.81 # C3

filename = "C:\\G_3.1\\comicsbook\\react_app\\public\\audio\\space.mp3"

# Note: Even though extension is .mp3, it will be a valid WAV file which html5 audio plays fine.
wav_file = wave.open(filename, "w")
wav_file.setnchannels(2)
wav_file.setsampwidth(2)
wav_file.setframerate(SAMPLE_RATE)

num_samples = int(DURATION * SAMPLE_RATE)
max_amp = 32767.0 / 4.0

for i in range(num_samples):
    t = float(i) / SAMPLE_RATE
    
    # Envelope (fade in / fade out)
    env = 1.0
    if t < 5.0:
        env = t / 5.0
    elif t > (DURATION - 5.0):
        env = (DURATION - t) / 5.0
        
    # Sine waves
    sample_left = (
        math.sin(2.0 * math.pi * FREQ_1 * t) * 0.4 +
        math.sin(2.0 * math.pi * FREQ_2 * t * 1.01) * 0.3 + 
        math.sin(2.0 * math.pi * FREQ_3 * t * 0.99) * 0.2 +
        (random.random() - 0.5) * 0.05
    )
    
    sample_right = (
        math.sin(2.0 * math.pi * FREQ_1 * t * 1.005) * 0.4 +
        math.sin(2.0 * math.pi * FREQ_2 * t * 0.995) * 0.3 + 
        math.sin(2.0 * math.pi * FREQ_3 * t * 1.005) * 0.2 +
        (random.random() - 0.5) * 0.05
    )
    
    val_l = int(sample_left * max_amp * env)
    val_r = int(sample_right * max_amp * env)
    
    # Clip
    val_l = max(min(val_l, 32767), -32768)
    val_r = max(min(val_r, 32767), -32768)
    
    wav_file.writeframesraw(struct.pack("<hh", val_l, val_r))

wav_file.close()
print("Audio generated!")
