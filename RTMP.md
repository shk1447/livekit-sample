# RTSP → RTMP (저지연 x264 + AAC 권장)

ffmpeg -loglevel verbose -rtsp_transport tcp \
 -i "rtsp://user1:!soxtest123@cctv.soxcorp.co.kr:5554/profile2/media.SMP" \
 -fflags +genpts+nobuffer -flags low_delay -use_wallclock_as_timestamps 1 \
 -fps_mode cfr -r 30 \
 -map 0:v:0 \
 -vf "format=yuv420p" \
 -c:v libx264 -preset veryfast -tune zerolatency \
 -profile:v main -level:v 4.0 \
 -x264-params "bframes=0:ref=1:scenecut=0:keyint=60:min-keyint=60:repeat-headers=1:aud=1:nal-hrd=cbr" \
 -g 60 -b:v 2000k -maxrate 2500k -bufsize 3000k \
 -an \
 -muxdelay 0 -muxpreload 0 -flvflags no_duration_filesize \
 -f flv "rtmp://124.56.79.147:1935/ingress/jQggK5oVqdhj"

ffmpeg -rtsp_transport tcp -i "rtsp://user1:!soxtest123@cctv.soxcorp.co.kr:5554/profile2/media.SMP" -c copy -f flv "rtmp://124.56.79.147:31935/ingress/jQggK5oVqdhj"

ffmpeg -rtsp_transport tcp -i "rtsp://user1:!soxtest123@cctv.soxcorp.co.kr:5554/profile2/media.SMP" -c:v libx264 -preset veryfast -c:a aac -f flv "rtmp://124.56.79.147:31935/ingress/jQggK5oVqdhj"

ffmpeg -loglevel verbose -rtsp_transport tcp -i "rtsp://user1:!soxtest123@cctv.soxcorp.co.kr:5554/profile2/media.SMP" -c:v copy -an -f whip "http://124.56.79.147:38080/ingress/K47xcCewAwAr"

ffmpeg -re -stream_loop -1 -i ./video.mp4 -c:v copy -c:a copy -f flv "rtmp://124.56.79.147:31935/ingress/hxZHgAAqC9MT"

ffmpeg -re -rtsp_transport tcp -i "rtsp://user1:!soxtest123@cctv.soxcorp.co.kr:5554/profile2/media.SMP" -c:v libx264 -preset veryfast -c:a aac -f flv -flush_packets 0 -rtbufsize 1000000k "rtmp://124.56.79.147:31935/ingress/jQggK5oVqdhj"

ffmpeg -loglevel verbose -re -rtsp_transport tcp -i "rtsp://user1:!soxtest123@cctv.soxcorp.co.kr:5554/profile2/media.SMP" -fflags +genpts+nobuffer -flags low_delay -use_wallclock_as_timestamps 1 -fps_mode cfr -r 30 -map 0:v:0 -vf "scale=1280:720:flags=bicubic,format=yuv420p" -c:v libx264 -preset veryfast -tune zerolatency -profile:v baseline -level:v 3.1 -x264-params "bframes=0:ref=1:scenecut=0:keyint=60:min-keyint=60:repeat-headers=1:aud=1:nal-hrd=cbr" -g 60 -b:v 1800k -maxrate 2200k -bufsize 3000k -an -f flv "rtmp://124.56.79.147:31935/ingress/9nMXmV3Ju4ss"

ffmpeg -loglevel verbose -re -rtsp_transport tcp -i "rtsp://210.99.70.120:1935/live/cctv001.stream" -fflags +genpts+nobuffer -flags low_delay -use_wallclock_as_timestamps 1 -fps_mode cfr -r 30 -map 0:v:0 -vf "scale=1280:720:flags=bicubic,format=yuv420p" -c:v libx264 -preset veryfast -tune zerolatency -profile:v baseline -level:v 3.1 -x264-params "bframes=0:ref=1:scenecut=0:keyint=60:min-keyint=60:repeat-headers=1:aud=1:nal-hrd=cbr" -g 60 -b:v 1800k -maxrate 2200k -bufsize 3000k -an -f flv "rtmp://124.56.79.147:31935/ingress/9nMXmV3Ju4ss"

rtsp://210.99.70.120:1935/live/cctv001.stream

streamKey
:
""
url
:
"rtmp://124.56.79.147:31935/hxZHgAAqC9MT"

ffmpeg -rtsp_transport tcp -i "rtsp://user1:!soxtest123@cctv.soxcorp.co.kr:5554/profile2/media.SMP" -c:v libx264 -preset veryfast -c:a aac -vbr 5 -f flv "rtmp://124.56.79.147:31935/x/WkyixJ5KnuXj"

ffmpeg -loglevel verbose -rtsp_transport tcp -i "rtsp://user1:!soxtest123@cctv.soxcorp.co.kr:5554/profile2/media.SMP" -c:v copy -an -f whip "http://124.56.79.147:38080/w/SnB785QwZ2os"

ffmpeg -loglevel verbose -re -rtsp_transport tcp \
 -i "rtsp://user1:!soxtest123@cctv.soxcorp.co.kr:5554/profile2/media.SMP" \
 -fflags +genpts+nobuffer -flags low_delay -use_wallclock_as_timestamps 1 \
 -fps_mode cfr -r 30 -map 0:v:0 \
 -vf "scale=1280:720:flags=bicubic,format=yuv420p" \
 -c:v libx264 -preset veryfast -tune zerolatency -profile:v baseline -level:v 3.1 \
 -x264-params "bframes=0:repeat-headers=1:aud=1:keyint=60:min-keyint=60:nal-hrd=cbr" \
 -g 60 -b:v 1800k -maxrate 2200k -bufsize 3000k \
 -an \
 -f whip "http://124.56.79.147:38080/ingress/K47xcCewAwAr"
