# Anki Vocabulary Decks

This folder contains tab-separated vocabulary files that can be imported into Anki.

## Daily English Vocabulary

File: [`daily-english-vocab.tsv`](daily-english-vocab.tsv)

Fields:

1. `Word`
2. `Phonetic`
3. `Chinese`
4. `Example`
5. `Tags`

Recommended Anki note setup:

- Front: `{{Word}}`
- Back: `{{Phonetic}}<br>{{Chinese}}<br><br>{{Example}}`
- Tags field: `Tags`

## Import

On Anki desktop:

1. Open Anki.
2. Choose `File` -> `Import`.
3. Select `daily-english-vocab.tsv`.
4. Set field separator to `Tab`.
5. Map fields in the order shown above.
6. Sync to AnkiMobile or AnkiDroid.

On AnkiDroid:

1. Copy `daily-english-vocab.tsv` to the phone.
2. Open AnkiDroid.
3. Use `Import`.
4. Choose tab-separated text and map the five fields.

