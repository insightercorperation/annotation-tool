import sys

import pandas as pd

def read_csv(file):

  df = pd.read_csv(file, encoding="cp1252", dtype='str')

  return df

def write_csv(df, filepath):
  df.to_csv(f'{filepath}', mode='w', encoding='cp1252', index=False)

def create_dict(main, mid, sub, applicationNumber, status, link): 
  return {
      'main': main, 'mid': mid,
      'sub': sub, 'applicationNumber': applicationNumber,
      'status': status, 'link': link
  }

def slice_viennacode(viennaCode):
  main = viennaCode[0:2]
  mid = viennaCode[2:4]
  sub = viennaCode[4:6]

  return (main, mid, sub)

if __name__ == "__main__":
  input_dir = sys.argv[1]
  input_file = sys.argv[2]

  fullpath = f'{input_dir}{input_file}'

  data = read_csv(fullpath).fillna(0)

  empty_vienna_data = data[data.viennaCode == 0]
  data = data[data.viennaCode != 0] # 결측치 제거 

  result = []

  for i in range(0, len(data.index)): 
    
    applicationNumber = data.iloc[i, 2]

    if applicationNumber:
      applicationNumber = applicationNumber.replace('.0', '')
    else:
      applicationNumber = data.iloc[i, 6]
    
    status = data.iloc[i, 3]

    link = data.iloc[i, 19]
    viennaCode = data.iloc[i, 18]

    if '|' in viennaCode:
      multiple_viennaCode = viennaCode.split('|')

      for viennaCode in multiple_viennaCode:
        main, mid, sub = slice_viennacode(viennaCode)
        result.append(create_dict(main, mid, sub, applicationNumber, status, link))
    else:
      main, mid, sub = slice_viennacode(viennaCode)
      result.append(create_dict(main, mid, sub, applicationNumber, status, link))

  write_csv(pd.DataFrame(result), f'./output/biblio.csv')
  write_csv(empty_vienna_data, f'./output/biblio_empty.csv')
