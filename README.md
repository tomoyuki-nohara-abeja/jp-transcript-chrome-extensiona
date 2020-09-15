

2020-09-12 07:57

実行環境の違い
index.html と Chrome.extension

オーディオの違い
mic, audioout

標準機能
[x] webspeechrecognition -> micのみ 
	-> MediaStreamなどからinputできないか調べたが方法がなさそう
		-> Google Speech APIの利用

Chrome.extension
[O] Chrom.tabcaptureを利用して、audiooutのstreamの取得に成功
	[ ] 認証をどうするか -> 先ずはローカル ¡-> あとでAndyに聞く


Goole Speech API
[-] 非同期の変換APIがある
	- Google API をstreamを使って呼び出す.
		[JavaScript で Google Cloud Speech-to-Text 音声認識 - yamaken1343’s blog](https://yamaken1343.hatenablog.jp/entry/2018/10/20/193514)



参考
[JavaScript で Google Cloud Speech-to-Text 音声認識 - yamaken1343’s blog](https://yamaken1343.hatenablog.jp/entry/2018/10/20/193514)
[arblast/Chrome-Audio-Capturer](https://github.com/arblast/Chrome-Audio-Capturer)

