import os
import shutil
import sys


if not os.path.exists("config.json"):
    if not os.path.exists("/data/config.json"):
        print("No 'config.json' in current data or '/data'", file=sys.stderr)
        sys.exit(1)
    shutil.copy("/data/config.json", "config.json")
    print("Using 'config.json' from '/data'")


# TODO need to think about where the 'roles.db' will be stored ... /data/roles.db unless a ./roles.db file exists?


from gandalf_bot import main


main()
