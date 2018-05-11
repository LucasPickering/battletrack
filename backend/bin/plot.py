import argparse
import matplotlib.pyplot as plt
import numpy as np
import os
import pickle


def circle_hist(data):
    r = np.arange(0.0, 1.1, step=0.1)
    data.hist(column='shift_factor', bins=r, weights=np.ones_like(data.index) / len(data.index))
    plt.title(f"Shift Factor Frequency - {len(data)} shifts")
    plt.xlabel("Shift Factor")
    plt.ylabel("Frequency")
    plt.xlim([0.0, 1.0])
    plt.xticks(r)


def kill_times_hist(data):
    num_plots = len(data)
    bins = range(35)
    for i, (map_name, kills) in enumerate(data.items(), 1):
        plt.subplot(num_plots, 1, i)
        plt.title(map_name)
        plt.hist(kills / 60., bins=bins)


_ACTIONS = {
    'circle_hist': circle_hist,
    'kill_times_hist': kill_times_hist,
}


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('action')
    parser.add_argument('infile')
    parser.add_argument('--save', '-s', default=None, nargs='?', action='store', const='')
    args = parser.parse_args()

    func = _ACTIONS[args.action]
    with open(args.infile, 'rb') as f:
        data = pickle.load(f)

    func(data)

    if args.save is not None:
        if args.save:
            outfile = args.save
        else:
            # Determine output file name
            inbase, _ = os.path.splitext(args.infile)
            outfile = f'{inbase}_{args.action}.png'
        plt.savefig(outfile)
        print(f"Saved to '{outfile}'")
    plt.show()
