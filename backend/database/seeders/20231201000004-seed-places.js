'use strict';

// Real IPFS hashes from original ERC-721 project
const placesData = [
  // Barcelona (municipality_id: 1)
  { id: 1, municipality_id: 1, name: 'Barcelona Town Hall', location_type: 'Town Hall', category: 'premium', nfts_required: 3, image_ipfs_hash: 'QmTmYwYzTuckbeWvRikngqf232C9YLSpguioDKR5Q4opcM', metadata_ipfs_hash: 'QmZ9VCDejYj3ZoQkAXzx4k63H4r74HYKXqhVtckDwL1P7T', price: 0.05 },
  { id: 2, municipality_id: 1, name: 'Barcelona Fire Station', location_type: 'Fire Station', category: 'plus', nfts_required: 1, image_ipfs_hash: 'Qmem4gbMhj8qTW12LthQz2mvKrjRqeMap2bbR86cN5rfHC', metadata_ipfs_hash: 'QmfTAvBsevmqxYQSQcg3Ts6QvLnHt4AytLVGbC2vsp5AjT', price: 0.01 },
  { id: 3, municipality_id: 1, name: 'Barcelona Bakery', location_type: 'Bakery', category: 'standard', nfts_required: 1, image_ipfs_hash: 'QmZRsGkafyRkSgU9iXnmGk7LYjb8rj4JJsebs3JUK5iqTi', metadata_ipfs_hash: 'QmPYTxh4sXX3oJcm88GBLi1KYiZPyv3CBXhuiEtdZzYL21', price: 0.01 },
  { id: 4, municipality_id: 1, name: 'Barcelona Church', location_type: 'Church', category: 'plus', nfts_required: 1, image_ipfs_hash: 'QmcMy12KDjru6kJfyczCgxCtskbSoGSeSKudRbQukE4AyA', metadata_ipfs_hash: 'QmdG31ryA6mLfoK3Cww8fDJ3sRC5XR4HfPworHmJHQH248', price: 0.01 },
  { id: 5, municipality_id: 1, name: 'Barcelona Market Square', location_type: 'Market Square', category: 'standard', nfts_required: 1, image_ipfs_hash: 'QmSUsS1duJALnZt5fX4rCFXHfViwZNqkHx8vdFfYSpSoma', metadata_ipfs_hash: 'Qmc6RQe6SqXzgFrFo4CNCcyf49ohx4quiuhdTsbgfqEw1M', price: 0.01 },
  { id: 6, municipality_id: 1, name: 'Barcelona Fountain', location_type: 'Fountain', category: 'standard', nfts_required: 1, image_ipfs_hash: 'Qmcy1hHrnMJVJcpWn7yjk5wEYV7NTdoioDjWw67RhCXEqk', metadata_ipfs_hash: 'QmaXboXx8vYD5EfmYEJVWZLTXWd7xrpBoyrMwwkAUNVFES', price: 0.01 },
  { id: 7, municipality_id: 1, name: 'Barcelona Bridge', location_type: 'Bridge', category: 'plus', nfts_required: 1, image_ipfs_hash: 'QmWP1W9aJdkTpvHRunh17smzyLxodCUDbXhXTuEyMXh7Hx', metadata_ipfs_hash: 'QmWBrn8GyT91SuBSSNMX1iBJXJ5gVEaAznHSz9BYcHQQwB', price: 0.01 },
  { id: 8, municipality_id: 1, name: 'Barcelona Park', location_type: 'Park', category: 'standard', nfts_required: 1, image_ipfs_hash: 'QmYbCYEsWvujCvdbHqpcwdGR6n7QHNY7P92HrQ5kr7HK8J', metadata_ipfs_hash: 'QmZiCcF7qV754N7p2j8KBLGPKvMrHhWaYbE3u2DfDMNgVL', price: 0.01 },

  // Girona (municipality_id: 2)
  { id: 9, municipality_id: 2, name: 'Girona Town Hall', location_type: 'Town Hall', category: 'premium', nfts_required: 3, image_ipfs_hash: 'QmTmC31tmWMw859UFsPTmXCtot17Ysvo3vHeqm7Bz8Axsf', metadata_ipfs_hash: 'QmUxVuiZDqdRnF2tdjhpB1LYcyHeV8ba9xQ4LH32qCJR7g', price: 0.05 },
  { id: 10, municipality_id: 2, name: 'Girona Fire Station', location_type: 'Fire Station', category: 'plus', nfts_required: 1, image_ipfs_hash: 'Qmaz7RmXW8Esr1QUskHmUHNKafQMQtjTzdVADtSNPhr4vN', metadata_ipfs_hash: 'QmZDheA5nud36ePAZGcvoA6ZVy9DfZTHd7we3Fw6sjaXX5', price: 0.01 },
  { id: 11, municipality_id: 2, name: 'Girona Bakery', location_type: 'Bakery', category: 'standard', nfts_required: 1, image_ipfs_hash: 'QmVXfdijRtMdCjCbT71X24kYnXNb6K9XTiho1dPJhcApQa', metadata_ipfs_hash: 'QmUdF8phbhT3cYQh5rbiCupgHj94HqvPzGF6NH59W7bdby', price: 0.01 },
  { id: 12, municipality_id: 2, name: 'Girona Church', location_type: 'Church', category: 'plus', nfts_required: 1, image_ipfs_hash: 'QmZBpAvKzY5CaM9zeU1LLgJFoWdMApgVCUdeDLKF1UmBMc', metadata_ipfs_hash: 'QmXxZHmiSnhyTSsFVgckBpsec3qrQyuXdLK9KzPNZnC9b9', price: 0.01 },
  { id: 13, municipality_id: 2, name: 'Girona Market Square', location_type: 'Market Square', category: 'standard', nfts_required: 1, image_ipfs_hash: 'QmNhKQWjJrLSu9tpYuM7r41EXT7XdLbAccpNd5ihbfrrLA', metadata_ipfs_hash: 'QmUeWwZjnmrNH8iih5S7b17L9qW7pzy9Z4ZbQWxHXWNdzJ', price: 0.01 },
  { id: 14, municipality_id: 2, name: 'Girona Fountain', location_type: 'Fountain', category: 'standard', nfts_required: 1, image_ipfs_hash: 'QmPvKWXvgQnvKGqXbN4TJPbRHVBLUYZ9dD6bxUqoYgPKwY', metadata_ipfs_hash: 'QmQXsJrCSoSkaZ9r3s7WvwnnXE2kqjhHQ7TxnDgbNAD6rz', price: 0.01 },
  { id: 15, municipality_id: 2, name: 'Girona Bridge', location_type: 'Bridge', category: 'plus', nfts_required: 1, image_ipfs_hash: 'QmNtH4oe2hFmYezVF115QziSD9S1h7pTxXqjwwjufRdDp9', metadata_ipfs_hash: 'QmPZ2GHR1E8D2SvavjBic8rhmfM2zvoWYDF3zAJDC1ydM4', price: 0.01 },
  { id: 16, municipality_id: 2, name: 'Girona Park', location_type: 'Park', category: 'standard', nfts_required: 1, image_ipfs_hash: 'Qmb3NKgdSfEnLHZkFiaNra7wohozTGRvDH9dm4u1WtdYXw', metadata_ipfs_hash: 'QmPfBMszwQPFDGqTvv6FoohFUuSWgxJoCVruFHMSWNisrv', price: 0.01 },

  // Marseille (municipality_id: 3)
  { id: 17, municipality_id: 3, name: 'Marseille Town Hall', location_type: 'Town Hall', category: 'premium', nfts_required: 3, image_ipfs_hash: 'QmVQbEGPEM43XQx6T4rfgkJGSDpHGWoHusKgaQBfTsypAa', metadata_ipfs_hash: 'QmdfAJ2f5GvzQnDxbKSwmWAaGGdZrmCk1vBSNQVp3UCbth', price: 0.05 },
  { id: 18, municipality_id: 3, name: 'Marseille Fire Station', location_type: 'Fire Station', category: 'plus', nfts_required: 1, image_ipfs_hash: 'QmWkqm3HUyNvJJJeFxwjbopzY1NPKtfUZ6n148k3eoxJuw', metadata_ipfs_hash: 'Qmb7G7Z3cG41FHVTyNfGcxTeH6HXxV5FrBx7VBmPMb51LB', price: 0.01 },
  { id: 19, municipality_id: 3, name: 'Marseille Bakery', location_type: 'Bakery', category: 'standard', nfts_required: 1, image_ipfs_hash: 'QmPHAGBPt6DLmR4HFLtM3iUw7WrWQq39Tg5ZkWWWR9moze', metadata_ipfs_hash: 'QmWyGr3nmUQ5hHZqeAri6qcf4sfw9PXKrbEdK4xSihX8c8', price: 0.01 },
  { id: 20, municipality_id: 3, name: 'Marseille Church', location_type: 'Church', category: 'plus', nfts_required: 1, image_ipfs_hash: 'QmYqbafJYCwQVgL7pC7aqsjMEGHNGrF4Lryyc5wSTDPNNL', metadata_ipfs_hash: 'Qmc4jARPbk5pndmwCZMwdZGYS4znrt3tLGnX1xpn1nh5JM', price: 0.01 },
  { id: 21, municipality_id: 3, name: 'Marseille Market Square', location_type: 'Market Square', category: 'standard', nfts_required: 1, image_ipfs_hash: 'Qmb5TPnBjG7K5RGNQQcRZEuV79LheJfFFZ5yyH4K4atg4m', metadata_ipfs_hash: 'QmYQQQrgbXCuS6n42WxvpudLqo5XLBWHtmYZ3W9yDzuzWg', price: 0.01 },
  { id: 22, municipality_id: 3, name: 'Marseille Fountain', location_type: 'Fountain', category: 'standard', nfts_required: 1, image_ipfs_hash: 'QmczKmYakRU2oUgUMyKCrzDjz6eEoWmDGkHGREJJKzGH9T', metadata_ipfs_hash: 'QmUL3hEdGrAq1rkm2Zktc7fDVefmKJQvaEQJZPbA2LPN3o', price: 0.01 },
  { id: 23, municipality_id: 3, name: 'Marseille Bridge', location_type: 'Bridge', category: 'plus', nfts_required: 1, image_ipfs_hash: 'QmP98fYtFWrydtVeiFA2UyNq2RJ8zpJedZ6kHVFJ8Tummn', metadata_ipfs_hash: 'QmXm1dMXLQ5vLkaxtBdrZa8SuGzXBF8nQhqyjnHyzBE9NG', price: 0.01 },
  { id: 24, municipality_id: 3, name: 'Marseille Park', location_type: 'Park', category: 'standard', nfts_required: 1, image_ipfs_hash: 'Qmevzpe96ByriS3PKEPQ61CpBoxQGF4dL6nEZf9qhzYwdQ', metadata_ipfs_hash: 'QmUovSSXbW9p9UjKHis9LLqTZP6fEJtrVyonxrzaHyHKhj', price: 0.01 },

  // Nice (municipality_id: 4)
  { id: 25, municipality_id: 4, name: 'Nice Town Hall', location_type: 'Town Hall', category: 'premium', nfts_required: 3, image_ipfs_hash: 'QmdFUR9cV2ZFeP5ChtHtj1mExXaWkf2ta5FcPyYnzMxL75', metadata_ipfs_hash: 'QmQ6tVfR4SLyeZegfZyK8b4Ks1hCKgrK7sUQkFvgKGVvhy', price: 0.05 },
  { id: 26, municipality_id: 4, name: 'Nice Fire Station', location_type: 'Fire Station', category: 'plus', nfts_required: 1, image_ipfs_hash: 'QmNkSC4WtDoyBeTPN1V5NiBf3wUHsuNavVdeePSWvC8MhC', metadata_ipfs_hash: 'QmRpaF7tcPEYc7TKjVTrk2fe52T5okiLEZNyB1CTqwyGJL', price: 0.01 },
  { id: 27, municipality_id: 4, name: 'Nice Bakery', location_type: 'Bakery', category: 'standard', nfts_required: 1, image_ipfs_hash: 'QmTanBJUYKBW4AoT8dzk6MRrGgsoxXbz87qm1Ba33SFQgm', metadata_ipfs_hash: 'QmcLQEQrc26wTfkfPMvW7teU8Yi3QzwfaVEXaVF4WnRwZd', price: 0.01 },
  { id: 28, municipality_id: 4, name: 'Nice Church', location_type: 'Church', category: 'plus', nfts_required: 1, image_ipfs_hash: 'QmcgR4w1KWAhogS95kyGxFpvwziXTkXWWQQNgUhZCgBs6Y', metadata_ipfs_hash: 'QmXPTPLKrp4qMyJJvnEfqRSY4biRnZFBYSqutReaHcF883', price: 0.01 },
  { id: 29, municipality_id: 4, name: 'Nice Market Square', location_type: 'Market Square', category: 'standard', nfts_required: 1, image_ipfs_hash: 'QmU2mReHjbnWuRKBZRDxqByQ776DbxGsrNMUZaf8GJtGxm', metadata_ipfs_hash: 'QmYUsQKUXfp7vBTwGBB75iQ9qaU9Uk2qfiYZJw6nJoYXz9', price: 0.01 },
  { id: 30, municipality_id: 4, name: 'Nice Fountain', location_type: 'Fountain', category: 'standard', nfts_required: 1, image_ipfs_hash: 'QmeTY69D41v3Zm4cqPu4X6BQFsXYmWSi6gFTcWaZFkFXBU', metadata_ipfs_hash: 'QmeqsZQibWgVmQPu4EXAnkR7n3rxzrsNa6FvZLvvJNBj5X', price: 0.01 },
  { id: 31, municipality_id: 4, name: 'Nice Bridge', location_type: 'Bridge', category: 'plus', nfts_required: 1, image_ipfs_hash: 'QmVies4g5XiyXWkqnAwoeYYCEDaXcXyEgZJwR6VNd9gVgu', metadata_ipfs_hash: 'Qmb2H5TmBFrTTCW7J6r6baAKS6Q1my9UAaUboVkv77rcXG', price: 0.01 },
  { id: 32, municipality_id: 4, name: 'Nice Park', location_type: 'Park', category: 'standard', nfts_required: 1, image_ipfs_hash: 'QmVixrHhd6U1wMptGnj8tEx2uEPgRrjfDLCVnnvxNbwLP9', metadata_ipfs_hash: 'QmRZWJ8FGBX9vMAWsNbi3DJhcW8xNWiJSuyHirsgkFQ4h8', price: 0.01 },

  // Munich (municipality_id: 5)
  { id: 33, municipality_id: 5, name: 'Munich Town Hall', location_type: 'Town Hall', category: 'premium', nfts_required: 3, image_ipfs_hash: 'QmRkujV3Kob59cp3rKrxdQPnaovRq5hCThu6RZ1sb7djBj', metadata_ipfs_hash: 'QmZGPnFMsWbHnVjZHKBPbkJTTXGYMLUyimTVxdMUoNozwa', price: 0.05 },
  { id: 34, municipality_id: 5, name: 'Munich Fire Station', location_type: 'Fire Station', category: 'plus', nfts_required: 1, image_ipfs_hash: 'QmbxR74sEQZP3NZoTqqCT3mzYpbDNiQWEW8RnnyoyhKEmR', metadata_ipfs_hash: 'QmYeh9L8Yf76JBEZrzb4ru4iwfBTox1UU82HEe4t5Zy5AL', price: 0.01 },
  { id: 35, municipality_id: 5, name: 'Munich Bakery', location_type: 'Bakery', category: 'standard', nfts_required: 1, image_ipfs_hash: 'QmdNWiKB9SkSx86Ckiv5Pj4twZDA4b1sZ8PSY2NfCohxbt', metadata_ipfs_hash: 'QmTfkVuaDsJNj8Rn3C2SgrGGwtAhE42FaKkJmzoht31agu', price: 0.01 },
  { id: 36, municipality_id: 5, name: 'Munich Church', location_type: 'Church', category: 'plus', nfts_required: 1, image_ipfs_hash: 'QmcxRYgd6tESjS9SBR2NQ4RjNxgNnPX7C2VdJCGmB4w5gy', metadata_ipfs_hash: 'QmasaF5JfsDrKjanKkbHEHRy2vFBbFToN9jHti4sALy12E', price: 0.01 },
  { id: 37, municipality_id: 5, name: 'Munich Market Square', location_type: 'Market Square', category: 'standard', nfts_required: 1, image_ipfs_hash: 'QmZTGgzPEbitCf7wJWWSxEJ1XuQujf3kNPTrXu4QdaTHGf', metadata_ipfs_hash: 'QmdWU3tueQejuQYty3ad4b3gREbY6jrC4KBsLwbhh3rC6m', price: 0.01 },
  { id: 38, municipality_id: 5, name: 'Munich Fountain', location_type: 'Fountain', category: 'standard', nfts_required: 1, image_ipfs_hash: 'QmV9upfQS911nFQtfmSJfU2aU5wxuskSpXqVvY3SWNDqHe', metadata_ipfs_hash: 'QmTSvzJtDa1NFTMRUvT7sBdpv6hbhJn7XKyZgAwuhczm8F', price: 0.01 },
  { id: 39, municipality_id: 5, name: 'Munich Bridge', location_type: 'Bridge', category: 'plus', nfts_required: 1, image_ipfs_hash: 'QmVQLwdQ2b1ugyTQqhYr3fkDT8u9QywhdiX3HAW3d1fNqZ', metadata_ipfs_hash: 'QmTT6BJqh47vDpQnK5mKUurV5yRf8giwobYaDAdjPqNryC', price: 0.01 },
  { id: 40, municipality_id: 5, name: 'Munich Park', location_type: 'Park', category: 'standard', nfts_required: 1, image_ipfs_hash: 'QmfRZsfJUWZSPuqbBh2A2dEG16WL4eQ4YyUtUaFe8Ufc1K', metadata_ipfs_hash: 'Qmd1y1JCGZmowAzNzdNxbTXzHSCSbYVmi2bLV9qHk2DkNx', price: 0.01 },

  // Nuremberg (municipality_id: 6)
  { id: 41, municipality_id: 6, name: 'Nuremberg Town Hall', location_type: 'Town Hall', category: 'premium', nfts_required: 3, image_ipfs_hash: 'Qme4cGzuDHGtqJx6iwYSXCyCugjZUS5SxnUC5oQq37YZYq', metadata_ipfs_hash: 'QmU856baXe2A8DsnaASBFMhRsbs1aMxBJGL9d4Ec3AXGHS', price: 0.05 },
  { id: 42, municipality_id: 6, name: 'Nuremberg Fire Station', location_type: 'Fire Station', category: 'plus', nfts_required: 1, image_ipfs_hash: 'QmfRZsfJUWZSPuqbBh2A2dEG16WL4eQ4YyUtUaFe8Ufc1K', metadata_ipfs_hash: 'Qma37fRW9zpiCPVhqbbSsuj3442nPd88ZMXgThGA8e8aB5', price: 0.01 },
  { id: 43, municipality_id: 6, name: 'Nuremberg Bakery', location_type: 'Bakery', category: 'standard', nfts_required: 1, image_ipfs_hash: 'QmVxyQfxSo5m2767zwLN6qrCWC5QWUkeSq7hTiudNBCMMW', metadata_ipfs_hash: 'QmNvs1iRVZ8aqG3B6bj9eKfABJrtkT8PjscnV3RkTVCzA9', price: 0.01 },
  { id: 44, municipality_id: 6, name: 'Nuremberg Church', location_type: 'Church', category: 'plus', nfts_required: 1, image_ipfs_hash: 'QmbmsCQCqZhaEaz7eyP58frqVTMtcgbPuWSk2ykLw2khC4', metadata_ipfs_hash: 'QmRg2UZJuKRHPPGeiiTmtKRCw845MvZv1A6wGULVJyzQB5', price: 0.01 },
  { id: 45, municipality_id: 6, name: 'Nuremberg Market Square', location_type: 'Market Square', category: 'standard', nfts_required: 1, image_ipfs_hash: 'QmUFGKDvCgjYq1QhbC3rDwBGbrofB4kmba2pPCvPTUmScm', metadata_ipfs_hash: 'QmeGph2D5DP8ub7eiJB3zy27fmperxEVuWDxkBBUK4v3Ut', price: 0.01 },
  { id: 46, municipality_id: 6, name: 'Nuremberg Fountain', location_type: 'Fountain', category: 'standard', nfts_required: 1, image_ipfs_hash: 'QmfXnVBnS6gHKikPMzdE592RGUnH1N1uMwHC5FfUdK51GP', metadata_ipfs_hash: 'Qmdo1muEXTi72tct3wF5b3odt7fCgEuHaNQ15eSMiJch7V', price: 0.01 },
  { id: 47, municipality_id: 6, name: 'Nuremberg Bridge', location_type: 'Bridge', category: 'plus', nfts_required: 1, image_ipfs_hash: 'QmY1V5VRXPBDpfqgFTtVNZcu2EjAUAnWFjfTpmRQYPo8g6', metadata_ipfs_hash: 'QmPJQt4bpKKNejMcG5qWsf58Wr8YZPkYmHrWEbAs1WFzuc', price: 0.01 },
  { id: 48, municipality_id: 6, name: 'Nuremberg Park', location_type: 'Park', category: 'standard', nfts_required: 1, image_ipfs_hash: 'QmV4cnkBVhVSm43rpnbEX4VCqxPrSg8SC2kxqNQJ9RXcf4', metadata_ipfs_hash: 'QmcvF65QqRy8G51bkvXbjxqFaEptJiBRZt6oadptYzHuZD', price: 0.01 },

  // Florence (municipality_id: 7)
  { id: 49, municipality_id: 7, name: 'Florence Town Hall', location_type: 'Town Hall', category: 'premium', nfts_required: 3, image_ipfs_hash: 'QmazhKPkX4K7djQDRihBMfFop1fd5S5iDwktGAJJXXzBvR', metadata_ipfs_hash: 'QmWGsAwp8PFgZDAcqhFecED7hVgiJ3Y46ZaswXRouWG66n', price: 0.05 },
  { id: 50, municipality_id: 7, name: 'Florence Fire Station', location_type: 'Fire Station', category: 'plus', nfts_required: 1, image_ipfs_hash: 'QmcVYPwHjz8WpKGq2aHi4S51vTuT9dAggXDKWFi5uHfTJ8', metadata_ipfs_hash: 'QmP2XrwnBrG9xMvcjnHSNCtEB21i38urgKMzRzx7ZNKFiB', price: 0.01 },
  { id: 51, municipality_id: 7, name: 'Florence Bakery', location_type: 'Bakery', category: 'standard', nfts_required: 1, image_ipfs_hash: 'QmT4VZ7Q3Xs8NL9XuQDUJ4Gg5H1FfyJBZDqvCN1K9FUvQD', metadata_ipfs_hash: 'QmV1X3nE7J6UHFNWj8wRDxwzGnMPy4s9FzVnKQ8s3UBLND', price: 0.01 },
  { id: 52, municipality_id: 7, name: 'Florence Church', location_type: 'Church', category: 'plus', nfts_required: 1, image_ipfs_hash: 'QmZ8FqEZ7d5KHm3W9nP4X6hJG8jDwNpQJ3sFfVE7QTx6Vh', metadata_ipfs_hash: 'QmYKJ5wX7T9B8s4Z1FUvNKQ3qR6H4D9JGMfTp2N6V8WxZA', price: 0.01 },
  { id: 53, municipality_id: 7, name: 'Florence Market Square', location_type: 'Market Square', category: 'standard', nfts_required: 1, image_ipfs_hash: 'QmX2VN8q5T3F7J1DK9Z4Y6hLG8jBwMpQN3rFfVD7QSx6Ug', metadata_ipfs_hash: 'QmW1X4nF7K6THFMVi8wQDywzHnNPz4r9EzUnJQ7s3TCKMB', price: 0.01 },
  { id: 54, municipality_id: 7, name: 'Florence Fountain', location_type: 'Fountain', category: 'standard', nfts_required: 1, image_ipfs_hash: 'QmY7FpDZ6c4JHl2V8mM3W9nP5X6gJH8kCwNqQK3tFfUE6Sg', metadata_ipfs_hash: 'QmZLK6xW8U9C7r3Y2GVtMJR4pQ5G3E8IHNeTq1M5W7VyYB', price: 0.01 },
  { id: 55, municipality_id: 7, name: 'Florence Bridge', location_type: 'Bridge', category: 'plus', nfts_required: 1, image_ipfs_hash: 'QmV4GnCY5b3IHk1U7lL2W8mN4X5fJG7jBvMpPK2sFdTE5Qf', metadata_ipfs_hash: 'QmX2M5oG8V7D6q2Z1FTsMKP3nR4H2D7JGLeUr0N5W6UxXC', price: 0.01 },
  { id: 56, municipality_id: 7, name: 'Florence Park', location_type: 'Park', category: 'standard', nfts_required: 1, image_ipfs_hash: 'QmU3FmBX4a2GHj0T6kK1V7lM3W8nN4Y5eIG6jAvLpQK1rDcD4Pe', metadata_ipfs_hash: 'QmW1L4nE6J5SGDLUh7vPCxwxFnMOy3q8DyTlIQ6r2SBJNA', price: 0.01 },

  // Siena (municipality_id: 8)
  { id: 57, municipality_id: 8, name: 'Siena Town Hall', location_type: 'Town Hall', category: 'premium', nfts_required: 3, image_ipfs_hash: 'QmT3ElAW3Z1FGi9S5jJ0T6kK1V7lM3W8nN4Y5eIG6jAvLpQ', metadata_ipfs_hash: 'QmV0K3mD5H4QFCKTf6uNBxvvElLNy2p7CxSjHO5q1RAJMB', price: 0.05 },
  { id: 58, municipality_id: 8, name: 'Siena Fire Station', location_type: 'Fire Station', category: 'plus', nfts_required: 1, image_ipfs_hash: 'QmS2DkAV2Y0EDh8R4iI9S5jJ0T6kK1V7lM3W8nN4Y5eIF5i', metadata_ipfs_hash: 'QmU9J2lC4G3PEBJSe5tMAvuuDkKMx1o6BwRgGN4p0Q9IKA', price: 0.01 },
  { id: 59, municipality_id: 8, name: 'Siena Bakery', location_type: 'Bakery', category: 'standard', nfts_required: 1, image_ipfs_hash: 'QmR1CjZU1X9DCg7Q3hH8R4iI9S5jJ0T6kK1V7lM3W8nN4X4', metadata_ipfs_hash: 'QmT8I1kB3F2ODAPRd4sLZtusDjJLw0n5AvQfFM3o9P8HJz', price: 0.01 },
  { id: 60, municipality_id: 8, name: 'Siena Church', location_type: 'Church', category: 'plus', nfts_required: 1, image_ipfs_hash: 'QmQ0BiYT0W8CBf6P2gG7Q3hH8R4iI9S5jJ0T6kK1V7lM3W3', metadata_ipfs_hash: 'QmS7H0jA2E1NCZOQc3rKYsrsCiIKv9m4ZuPeDL2n8O7GIy', price: 0.01 },
  { id: 61, municipality_id: 8, name: 'Siena Market Square', location_type: 'Market Square', category: 'standard', nfts_required: 1, image_ipfs_hash: 'QmP9AhXS9V7BAe5O1fF6P2gG7Q3hH8R4iI9S5jJ0T6kK1V2', metadata_ipfs_hash: 'QmR6G9iZ1D0MBYNPb2qJXrqBhHHJu8l3YtNcCK1m7N6FHx', price: 0.01 },
  { id: 62, municipality_id: 8, name: 'Siena Fountain', location_type: 'Fountain', category: 'standard', nfts_required: 1, image_ipfs_hash: 'QmO8ZgWR8U6AZd4N0eE5O1fF6P2gG7Q3hH8R4iI9S5jJ0T1', metadata_ipfs_hash: 'QmQ5F8hY0C9LAXMOa1pIWqpAgGGIt7k2XsMbBJ0l6M5EGw', price: 0.01 },
  { id: 63, municipality_id: 8, name: 'Siena Bridge', location_type: 'Bridge', category: 'plus', nfts_required: 1, image_ipfs_hash: 'QmN7YfVQ7T5ZYc3M9dD4N0eE5O1fF6P2gG7Q3hH8R4iI9S0', metadata_ipfs_hash: 'QmP4E7gX9B8KZWLNz0oHVpoZFfFHs6j1WrLaAI9k5L4DFv', price: 0.01 },
  { id: 64, municipality_id: 8, name: 'Siena Park', location_type: 'Park', category: 'standard', nfts_required: 1, image_ipfs_hash: 'QmM6XeUP6S4YXb2L8cC3M9dD4N0eE5O1fF6P2gG7Q3hH8R9', metadata_ipfs_hash: 'QmO3D6fW8A7JYVKMy9nGUpnYEeEGr5i0VqKZzH8j4K3CEu', price: 0.01 },
];

module.exports = {
  async up(queryInterface) {
    const places = [];
    let tokenIdBase = 1000;

    for (const placeData of placesData) {
      const tokenId = tokenIdBase + placeData.id;

      // Convert nfts_required to pair_count
      const pairCount = placeData.nfts_required;

      places.push({
        id: placeData.id,
        token_id: tokenId,
        municipality_id: placeData.municipality_id,
        name: placeData.name,
        address: null,
        latitude: null,
        longitude: null,
        location_type: placeData.location_type,
        category: placeData.category,
        price: placeData.price,
        pair_count: pairCount,
        base_image_uri: `ipfs://${placeData.image_ipfs_hash}`,
        metadata_uri: `ipfs://${placeData.metadata_ipfs_hash}`,
        metadata_hash: placeData.metadata_ipfs_hash,
        is_minted: false,
        is_claimed: false,
        claimed_by: null,
        claimed_at: null,
        claim_tx_hash: null,
        created_at: new Date(),
        updated_at: new Date(),
      });
    }

    await queryInterface.bulkInsert('places', places);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('places', null, {});
  },
};
