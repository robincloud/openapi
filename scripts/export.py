import requests
from multiprocessing import Pool
import getopt, sys
import csv
from functools import partial
from tqdm import tqdm

CSVFILENAME = "items2.csv"
ITEMCOUNT = 1000000
FIELDNAMES = ("id", "sid", "item_name", "thumbnail")
POST_URL = 'https://robin-api.oneprice.co.kr/items'
PROCESSES = 30  # os.cpu_count()


def post(startIdx, count):
    n = int(startIdx / count)
    text = "process #{}".format(n)
    for i in tqdm(range(startIdx, startIdx + count), desc=text, position=n):
        try:
            requests.post(POST_URL, json=dataList[i])
            # print("sent: ", dataList[i])
        except Exception as e:
            print(e)
            print("failed to send: ", dataList[i])


def usage():
    print("./export.py --csvfile=filename --itemcount=10000")


def run():
    print("CSVFILENAME=", CSVFILENAME, "ITEMCOUNT=", ITEMCOUNT)
    dataList = [None] * ITEMCOUNT
    with open(CSVFILENAME) as csvfile:
        reader = csv.DictReader(csvfile,FIELDNAMES)
        for idx, row in enumerate(reader):
            data = {
                'agent': 'dummy#1',
                'id': row['id'],
                'mid': int(row['id'][3:]),
                'data': [
                    {
                        "item_name": row['item_name'],
                        'meta': {
                            'thumbnail': row['thumbnail'] }
                    },
                ],
            }
            dataList[idx] = data
        print("loaded: ", CSVFILENAME, "count: ", len(dataList))
        with Pool(processes=PROCESSES) as pool:
            COUNT = int(len(dataList) / PROCESSES)
            pool.map(partial(post, count=COUNT), range(0, len(dataList), COUNT))


if __name__ == '__main__':
    try:
        opts, args = getopt.getopt(sys.argv[1:], "hc:i:", ["help", "csvfile=", "itemcount="])
    except getopt.GetoptError as err:
        print(str(err))
        usage()
        sys.exit(2)
    for o, a in opts:
        if o in ("-h", "--help"):
            usage()
            sys.exit(0)
        elif o in ("-c", "--csvfile"):
            CSVFILENAME = a
        elif o in ("-i", "--itemcount"):
            ITEMCOUNT = a
        else:
            assert False, "unhandled option"
    run()


