# Prompt Library

Gotowe zasoby referencyjne do Gemini i do wewnetrznego systemu assetow Project Party.

## Aktualny Zestaw

- `nano-banan-game-art.md`
  Bazowy system stylu dla spojnych hero i kart gry. To jest glowny punkt odniesienia dla jezyka wizualnego Project Party.

- `gemini-image-generator.md`
  Zasob dla Gema generujacego statyczne grafiki. Gem ma zadac 2-3 krotkie pytania, a potem wygenerowac finalny obraz bez przechodzenia w tryb pisania briefu.

- `gemini-video-generator.md`
  Zasob dla Gema generujacego krotkie materialy wideo. Gem ma zawsze najpierw rozroznic:
  - `seamless loop`
  - `zwykle krotkie wideo`

## Rekomendowany Zestaw Do Gemini

Do Gema od obrazow wrzuc:
- `gemini-image-generator.md`
- `nano-banan-game-art.md`
- najlepsze dotychczasowe assety Project Party jako referencje wizualne

Do Gema od wideo wrzuc:
- `gemini-video-generator.md`
- `nano-banan-game-art.md`
- najlepsze dotychczasowe loopy lub short videos jako referencje wizualne

## Jak Tego Uzywac

Najlepszy model pracy:
- Gem zadaje 2-3 krotkie pytania
- Gem nie pisze dlugiego opisu
- Gem od razu generuje asset
- styl ma pozostac spojny z Project Party

Najwazniejsze rozroznienie:
- obraz = kompozycja statyczna
- video = ruch
- loop = poczatek i koniec musza sie laczyc bez widocznego przeskoku

## Uwaga Praktyczna

Jesli Gemini zaczyna za bardzo improwizowac:
- dodaj wiecej realnych assetow jako zasoby referencyjne
- trzymaj `nano-banan-game-art.md` jako wspolny punkt odniesienia
- nie zostawiaj Gema tylko z ogolna instrukcja bez materialu wzorcowego
