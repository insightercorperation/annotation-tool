import sys

import pandas as pd

def read_csv(file):

  df = pd.read_csv(file, encoding="cp1252", dtype='str')

  return df

def write_csv(df, filepath):
  df.to_csv(f'{filepath}', mode='w', encoding='cp1252', index=False)

if __name__ == "__main__":
  input_dir = sys.argv[1]
  input_file = sys.argv[2]

  fullpath = f'{input_dir}{input_file}'

  data = read_csv(fullpath)

  main_list = data['main'].sort_values().drop_duplicates()

  for main in main_list:
    result = data[data.main == main].sort_values(["mid", "sub"])
    images_count = len(result['link'].drop_duplicates())

    write_csv(result, f'./output/main/main_{main}_{images_count}.csv')

