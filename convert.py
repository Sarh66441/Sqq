import sys
import speech_recognition as sr

# Get the audio file path from the arguments
audio_file = sys.argv[1]

# Initialize recognizer
recognizer = sr.Recognizer()

# Load the audio file
with sr.AudioFile(audio_file) as source:
    audio = recognizer.record(source)

# Recognize speech using Google Web Speech API
try:
    text = recognizer.recognize_google(audio)
    print(text)
except sr.UnknownValueError:
    print("Google Speech Recognition could not understand audio")
except sr.RequestError as e:
    print(f"Could not request results from Google Speech Recognition service; {e}")
