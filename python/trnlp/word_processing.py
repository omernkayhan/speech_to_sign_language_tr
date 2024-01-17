# -*- coding: utf-8 -*-
""" /*Copyright 2018 Esat Mahmut Bayol

This program is free software; you can redistribute it and/or modify it under
the terms of the GNU General Public License as published by the Free Software
Foundation; either version 2 of the License, or (at your option) any later
version.

This program is distributed in the hope that it will be useful, but WITHOUT
ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with
this program; if not, write to the Free Software Foundation, Inc., 59 Temple
Place, Suite 330, Boston, MA 02111-1307 USA

*/"""
import re

clean_quiet = re.compile('[^aâeêıîioôöuûü]')
lower_vowel = 'aâeêıîioôöuûü'
lower_quiet = 'bcçdfgğhjklmnprsştvyzqwx'


# Gelen kelimeyi, sesli harfler "1", sessiz harfler "0" olmak üzere sayıya çevirir
# String olarak geri döndürür
def wordtoten(word):
    word = to_lower(word)
    translate_wtonum_0 = str.maketrans(lower_quiet, len(lower_quiet) * '0')
    translate_wtonum_1 = str.maketrans(lower_vowel, len(lower_vowel) * '1')
    word = (word.translate(translate_wtonum_1)).translate(translate_wtonum_0)

    return word


# Gelen string(yazı) veriyi küçük harfe çevirir.
def to_lower(word):
    tolower_text = (word.replace('İ', 'i'))
    tolower_text = (tolower_text.replace('I', 'ı'))
    tolower_text = tolower_text.lower()
    return tolower_text


# Gelen string(yazı) veriyi büyük harfe çevirir.
def to_upper(word):
    toupper_text = (word.replace('i', 'İ'))
    toupper_text = (toupper_text.replace('ı', 'I'))
    toupper_text = toupper_text.upper()
    return toupper_text


def spellword(word: str):
    syllable_list = []
    # Bulduğumuz heceleri bu listede toplayacağız.
    syllable = ""
    # Harfleri bir hece oluşturana kadar "syllable" değişkenine yazacağız.
    gword = to_lower(word)
    # "gword" değişkenine kelimemizin küçük harfe çevrilmiş halini atıyoruz.
    tword = wordtoten(word)
    # "tword" değişkenine kelimemizin sayılara çevrilmiş halini atıyoruz.
    if tword.startswith('000') or tword.endswith('000'):
        return False

    tword = tword + '.....'
    len_vowel = tword.count('1')
    counter = 0

    for i, char in enumerate(tword):
        if counter > 0:
            counter -= 1
            continue

        if char == '.':
            if syllable and syllable.count('1') == 1:
                syllable_list.append(gword[:len(syllable)])
            break
        elif char == '0':
            syllable = syllable + char
            if syllable and (syllable == '000'):
                break
            continue
        elif char == '1':
            syllable = syllable + char
            x = len(syllable)
            if (tword[x:x + 2] == '01') or (tword[x:x + 2] == '10') or (tword[x:x + 2] == '1.'):
                syllable_list.append(gword[:x])
                gword = gword[x:]
                tword = tword[x:]
                syllable = ''
                continue
            elif tword[x:x + 3] == '001':
                syllable_list.append(gword[:x + 1])
                gword = gword[x + 1:]
                tword = tword[x + 1:]
                syllable = ''
                counter += 1
                continue
            elif tword[x:x + 3] == '00.':
                syllable_list.append(gword[:x + 2])
                del gword
                break
            elif tword[x:x + 4] == '0001':
                syllable_list.append(gword[:x + 2])
                gword = gword[x + 2:]
                tword = tword[x + 2:]
                syllable = ''
                counter += 2
                continue
            elif tword[x:x + 5] == '00001':
                syllable_list.append(gword[:x + 2])
                gword = gword[x + 2:]
                tword = tword[x + 2:]
                syllable = ''
                counter += 2
                continue
    if (''.join(syllable_list) == word) and (len_vowel == len(syllable_list)):
        return syllable_list
    else:
        return False


# Küçük sesli uyumu kontrolü. True yada False döndürür.
def trmi_ksucontrol(word):
    # Düz Sesliler: a, e, ı, i
    # Yuvarlak Sesliler: o, ö, u, ü
    # Dar Sesli Harfler: ı, i, u, ü
    # Geniş Sesli Harfler: a, e, o, ö
    # Bir sözcükte düz ünlü harflerden  (a, e, ı, i) sonra yine düz ünlü harfler(a, e, ı, i) gelebilir.
    # Bir sözcükte yuvarlak ünlü harflerden (o, ö, u, ü) sonra düz/geniş (a, e) ve dar/yuvarlak (u, ü) sesli
    #  harfler gelebilir.
    # Küçük ünlü uyumunda her bir sesli harf kendinden önceki sesli harften sorumludur.
    # Küçük sesli uyumu kontrolü
    # sonu “ol” ya da “alp” ile biten
    # yabancı sözcüklere getirilen ekler bu kurala uymaz ve ince sesli içerirler. Bu
    # duruma örnek olarak “kalp” ve “gol” sözcükleri verilebilir.
    # • -yor, -ken , -ki, -leyin, -imtrak, -gil ekleri sesli uyumuna uymazlar.
    if not word:
        return True

    duz_sesliler = 'aâeêıîi'
    yuvarlak_sesliler = 'oôöuûü'
    duz_genis_dar_yuvarlak = 'aâeêuûü'

    lower_word = to_lower(word).strip()
    clr_word = clean_quiet.sub('', lower_word)
    lenght_vow = len(clr_word)

    i = 1
    ksu = True
    while i < lenght_vow:
        i += 1
        if (clr_word[i - 2] in duz_sesliler) and (clr_word[i - 1] not in duz_sesliler):
            ksu = False
            break

        if (clr_word[i - 2] in yuvarlak_sesliler) and (clr_word[i - 1] not in duz_genis_dar_yuvarlak):
            ksu = False
            break

    return ksu


# Büyük sesli uyumu kontrolü. True yada False döndürür.
def trmi_bsucontrol(word):
    # Kural olarak; ince seslilerden sonra ince sesliler, kalın seslilerden sonra kalın sesliler gelir
    # ince sesliler = e,i,ö,ü
    # kalın sesliler = a,ı,o,u
    # Büyük sesli uyumu kontrolü
    # sonu “ol” ya da “alp” ile biten
    # yabancı sözcüklere getirilen ekler bu kurala uymaz ve ince sesli içerirler. Bu
    # duruma örnek olarak “kalp” ve “gol” sözcükleri verilebilir.
    # • -yor, -ken , -ki, -leyin, -imtrak, -gil ekleri sesli uyumuna uymazlar.
    if not word:
        return True

    kalin_unlu_harfler = 'aâıîoôuû'
    ince_unlu_harfler = 'eêiöü'

    lower_word = to_lower(word)
    clr_word = clean_quiet.sub('', lower_word)
    lenght_vow = len(clr_word)

    if not clr_word:
        return True

    bsu = True
    if (clr_word[0] in kalin_unlu_harfler) and (lenght_vow > 1):
        for i in clr_word[1:]:
            if i not in kalin_unlu_harfler:
                bsu = False
                break

    if (clr_word[0] in ince_unlu_harfler) and (lenght_vow > 1):
        for i in clr_word[1:]:
            if i not in ince_unlu_harfler:
                bsu = False
                break
    return bsu


def trmi_nb_uyumu(word):
    # Türkçe’de birleşik sözcük ve yer adları dışında n ve b sessizleri yan yana bulunmaz.
    if 'nb' in word:
        nb = False
    else:
        nb = True
    return nb


def trmi_son_sessiz_uyumu(word):
    iword = to_lower(word)
    # Türkçe bir sözcüğün sonunda süreksiz yumuşak sessiz (b, c, d, g) bulunmaz, böyle sesler süreksiz sert
    # sessizlere (p, ç, t, k) dönüşür.
    sys = ('b', 'c', 'd', 'g')
    if iword[-1] in sys:
        sys = False
    else:
        sys = True
    return sys


def trmi_ilk2_sessiz_uyumu(word):
    iword = to_lower(word)
    nword = wordtoten(iword)
    # Türkçe’de sözcük iki sessiz harf ile başlayamaz.
    if nword[:2] == '00':
        first_two_letters = False
    else:
        first_two_letters = True

    return first_two_letters


def trmi_son3_sessiz_uyumu(word):
    iword = to_lower(word)
    nword = wordtoten(iword)
    # Türkçe’de sözcük üç sessiz harf ile bitemez.
    if nword[-3:] == '000':
        last_three_letters = False
    else:
        last_three_letters = True

    return last_three_letters


def trmi_son2_sessiz_uyumu(word):
    iword = to_lower(word)
    nword = wordtoten(iword)
    # Türkçe’de sözcük ve hece sonlarında bulunabilecek sessiz çiftleri
    last_two_letters = {'l': 'çkpt',
                        'n': 'çkt',
                        'r': 'çkpst',
                        's': 't',
                        'ş': 't'}

    if nword.endswith('00') and (iword[-2] in last_two_letters):
        second_letter = iword[-2]
        if iword[-1] in last_two_letters[second_letter]:
            last_two = True
        else:
            last_two = False
    else:
        last_two = True

    return last_two


def sessiz_uyumu(word):
    iword = to_lower(word)
    nword = wordtoten(iword)

    # Bu kurala göre, sert sessizlerden
    # sonra sert sessiz veya sert karşılığı bulunmayan yumuşak sessiz gelebilir. “ç - f - h - k
    # - p - s - ş – t” harflerinden sonra “ç - f - h - k - p - s - ş - t - l - m - n - r – y” harfleri
    # gelmelidir.
    #
    # Sert karşılığı bulunmayan yumuşak sessizlerden sonra tüm sessizler
    # gelebilir. “l - m - n - r – y” harflerinden sonra bütün sessiz harfler gelebilir. Sert
    # karşılığı bulunan yumuşak sessizlerden sonra yumuşak sessizler gelebilir. “b - c - d -
    # g - ğ - j - v – z” harflerinden sonra “b - c - d - g - ğ - j - v - z - l - m - n - r – y”
    # harfleri gelmelidir.

    sert_sessiz = ('ç', 'f', 'h', 'k', 'p', 's', 'ş', 't')
    sert_sessiz_kar = ('ç', 'f', 'h', 'k', 'p', 's', 'ş', 't', 'l', 'm', 'n', 'r', 'y')
    yum_sessiz = ('b', 'c', 'd', 'g', 'ğ', 'j', 'v', 'z')
    yum_sessiz_kar = ('b', 'c', 'd', 'g', 'ğ', 'j', 'v', 'z', 'l', 'm', 'n', 'r', 'y')
    sksiz_yumusak_sessiz = ('l', 'm', 'n', 'r', 'y')

    ss_sessiz = False
    if '00' in nword:
        nnword = nword
        iiword = iword
        while '00' in nnword:
            mt = re.search('00', nnword)
            x, y = mt.span()
            iiword = iiword[x:]

            if iiword[0] in sksiz_yumusak_sessiz:
                iiword = iiword[y:]
                nnword = nnword[y:]
                ss_sessiz = True
                continue

            if iiword[0] in sert_sessiz and iiword[1] in sert_sessiz_kar:
                iiword = iiword[y:]
                nnword = nnword[y:]
                ss_sessiz = True
                continue

            if iiword[0] in yum_sessiz and iiword[1] in yum_sessiz_kar:
                iiword = iiword[y:]
                nnword = nnword[y:]
                ss_sessiz = True
                continue

            if ss_sessiz is not True:
                ss_sessiz = False
                break
    return ss_sessiz
