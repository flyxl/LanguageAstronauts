package com.cocos.game;

import android.content.Context;
import android.os.Build;
import android.speech.tts.TextToSpeech;

import java.util.Locale;

/**
 * Offline teaching TTS for listening prompts.
 * Called from TypeScript via native.reflection.callStaticMethod.
 */
public final class TtsBridge {
    private static TextToSpeech tts;
    private static boolean ready;
    private static String pendingText;
    private static String pendingLang;

    private TtsBridge() {}

    public static void init(Context context) {
        if (tts != null) return;
        final Context app = context.getApplicationContext();
        tts = new TextToSpeech(app, status -> {
            ready = status == TextToSpeech.SUCCESS;
            if (ready && pendingText != null) {
                speak(pendingText, pendingLang != null ? pendingLang : "en-US");
                pendingText = null;
                pendingLang = null;
            }
        });
    }

    public static void speak(String text, String lang) {
        if (text == null) return;
        final String trimmed = text.trim();
        if (trimmed.isEmpty()) return;

        if (tts == null || !ready) {
            pendingText = trimmed;
            pendingLang = lang;
            return;
        }

        Locale locale = Locale.US;
        if (lang != null) {
            String lower = lang.toLowerCase(Locale.US);
            if (lower.startsWith("zh")) {
                locale = Locale.SIMPLIFIED_CHINESE;
            } else if (lower.startsWith("en-gb")) {
                locale = Locale.UK;
            }
        }
        try {
            tts.setLanguage(locale);
        } catch (Exception ignored) {
            // Keep default voice if locale unavailable.
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            tts.speak(trimmed, TextToSpeech.QUEUE_FLUSH, null, "la-learning");
        } else {
            tts.speak(trimmed, TextToSpeech.QUEUE_FLUSH, null);
        }
    }

    public static void stop() {
        pendingText = null;
        pendingLang = null;
        if (tts != null) {
            try {
                tts.stop();
            } catch (Exception ignored) {
            }
        }
    }

    public static void shutdown() {
        stop();
        if (tts != null) {
            try {
                tts.shutdown();
            } catch (Exception ignored) {
            }
            tts = null;
        }
        ready = false;
    }
}
