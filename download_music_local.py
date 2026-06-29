import os
import subprocess

def main():
    audio_dir = os.path.join("react_app", "public", "audio")
    os.makedirs(audio_dir, exist_ok=True)
    
    # 3 длинных эмбиент-трека без авторских прав (Space/Ambient CC0)
    tracks = [
        "https://www.youtube.com/watch?v=FjHGZj2IjA8", # Deep Space Ambient
        "https://www.youtube.com/watch?v=vPhg6sc1Mk4", # Relaxing Space Music
        "https://www.youtube.com/watch?v=R9_K2v5H0Wk"  # Calm Sci-Fi Drone
    ]
    
    for i, url in enumerate(tracks):
        output_file = f"space{i+1}.mp3"
        print(f"\nСкачиваем трек {i+1} из 3...")
        # Используем spotdl для загрузки
        subprocess.run(["spotdl", "download", url, "--output", output_file], cwd=audio_dir)
        
    print("\n✅ Все треки успешно скачаны!")
    print("Теперь можно запустить сборку: python build_android.py")

if __name__ == "__main__":
    main()
