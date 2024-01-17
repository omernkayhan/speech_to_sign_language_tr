import trnlp
import json
import sys

kelime = sys.argv[1]

data = {
    "word": trnlp.find_stems(kelime)[0],
    "data": trnlp.find_suffix(kelime)[0]
}
json_str = json.dumps(data)
print(json_str)