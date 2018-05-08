import argparse
import matplotlib.pyplot as plt
import numpy as np
import os
import pandas as pd


def circle_hist(data):

    # Render summary table
    # plt.table(cellText=[
    #     ['Average Shift Factor', f"{data['shift_factor'].mean():.2f}"],
    #     ['Hard Shift %', f"{data['is_hard_shift'].mean() * 100:.1f}"],
    # ])

    # Render histogram
    r = np.arange(0.0, 1.1, step=0.1)
    data.hist(column='shift_factor', bins=r, weights=np.ones_like(data.index) / len(data.index))
    plt.title(f"Shift Factor Frequency - {len(data)} shifts")
    plt.xlabel("Shift Factor")
    plt.ylabel("Frequency")
    plt.xlim([0.0, 1.0])
    plt.xticks(r)


_ACTIONS = {
    'circle_hist': circle_hist,
}


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('action')
    parser.add_argument('input')
    parser.add_argument('--save', '-s', default=None, nargs='?', action='store', const='')
    args = parser.parse_args()

    func = _ACTIONS[args.action]
    data = pd.read_pickle(args.input)

    fig = func(data)

    if args.save is not None:
        if args.save:
            outfile = args.save
        else:
            # Determine output file name
            inbase, _ = os.path.splitext(args.input)
            outfile = f'{inbase}_{args.action}.png'
        plt.savefig(outfile)
        print(f"Saved to '{outfile}'")
    plt.show()
