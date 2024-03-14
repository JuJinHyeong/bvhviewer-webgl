BVH viewer implemented by webGL
========================

실행
-----
index.html에서 원하는 버튼을 눌러서 bvh 파일을 선택한다.
canvas를 드래그 해서 어떻게 보이는지 확인한다.

BVH file
--------
BVH 파일은 애니메이션을 표현하는 파일이고, 크게 2부분으로 나뉜다.
Hierarchy	 /  Motion

1. Hierarchy
__"HIERARCHY"__키워드로 시작된다. 스켈레톤의 구조를 재귀적으로 나타내는 곳이다.
각 세그먼트는 해당 세그먼트의 데이터와, 재귀적으로 자식을 정의한다.

* ROOT
ROOT키워드로 시작한다. 키워드 뒤에 이 세그먼트의 이름이 정의된다.
하나의 왼쪽 중괄호가 나오고, 그 이후, 이 세그먼트의 데이터들을 정의한다.
처음 데이터는 오프셋이다. OFFSET 키워드 이후 3개의 X, Y, Z 값이 정의된다.
다음 데이터는 채널 정보이다. CHANNELS 키워드 이후, 채널의 개수가 나오고, 채널에 대한 정보가 정의된다.

* JOINT, SITE
재귀가 시작되는 곳이고, 나머지 정보들은 채널의 개수를 제외하고 ROOT와 동일하다.

2. Motion
__"MOTION"__키워드로 시작된다.
* "Frames:" 뒤에 프레임 수가 나타난다.
* "Frame time:" 뒤에 샘플 속도가 나타난다.
이후에는 Hierarchy에서 정의한 각 세그먼트의 CHANNELS의 값이 들어있다.

bvh_reader.js
--------------
bvh파일을 파싱하고, 값을 계산하는 스크립트이다.
위에서 설명한 방법으로 파싱을 실행한다.

    1) bvh_source파일을 HIERARCHY와 MOTION으로 나눈다.
    
    2) HIERARCHY의 소스코드로 hierarchy를 정의한다.
    
    3) MOTION의 소스코드로 motion을 정의한다.
    
    4) hierarchy와 motion으로 실제 스켈레톤의 vertices를 계산한다.
    

* node : 스켈레톤의 각 node를 표현하는 구조이다.
node의 이름, 부모 node, offset, channel, children과 matrix을 가진다.

* bvh : bvh파일을 저장하는 구조이다. 
스켈레톤을 구성하는 root와 파싱으로 얻는 값들, 각 프레임마다 가지는 vertices를 가지고, indices를 가진다.

* set_hierarchy
HIERARCHY 소스코드로 hierarchy를 정의한다.
    1) 소스코드를 줄 단위로 보면서, 단어 단위로 자른다.
    2) 처음 키워드가 ROOT이면, 새로운 node를 생성하고, 현재 보는 node를 root로 설정한다.
    3) JOINT, END면, 현재 보고 있는 node를 부모로 가지는 node를 생성한다.
    4) CHANNELS면, 현재 node의 channel에 값들을 추가한다.
    5) OFFSET이면 현재 node의 offset에 값을 추가한다.
    6) '}' 이면 현재 node를 현재node의 parent node로 바꾼다.
    7) 모든 소스코드를 다 볼 때 까지 반복한다.

* set_motion(bvh, motion_source) : 
MOTION 소스코드로 motion을 정의한다.
    1) 소스코드를 줄 단위로 보면서, 단어 단위로 자른다.
    2) 첫 번째 줄에서 frame 수가 정의된다.
    3) 두 번째 줄에서 fps가 정의된다.
    4) 나머지 줄은 motion에 저장한다.

* set_matrix(bvh, node, frame) : 
hierarchy의 채널의 값을 통해서 각 스켈레톤 node의 matrix를 계산한다.
    1) node의 matrix를 초기화.
    2) offset만큼 matrix를 translate.
    3) 채널의 정보를 확인해서 (XYZ)position이면, 각 축에 해당하는 만큼 translate.
    4) (XYZ)rotation이면, 각 축으로 값의 radian만큼 rotate.
    5) node의 부모의 matrix와 곱해서 matrix를 정의.
    6) 자신의 자식에 대해서 재귀적으로 실행.

* set_vertices(bvh, node, parent_index, frame) : 
set_matrix로 얻은 각 node의 matrix로 vertices를 계산하고, index를 계산한다.
    1) vertex는 노드의 matrix의 3번째 행이다.
    2) parameter로 받은 frame에 해당하는 vertices[frame]에 vertex를 저장한다.
    2) index buffer를 사용하기 위해서, 부모의 index와 현재 index를 index data에 대입한다.
    3) 자신의 자식에 대해서 재귀적으로 실행한다.

* set_vertices_frame(bvh) : 
각 frame에 대해서 vertices와 indices를 계산한다.
    1) set_matrix로 matrix를 현재 frame에 대해서 초기화 해준다.
    2) set_vertices로 vertices와 indcies를 계산한다.

bvh_viewer.js
--------------
### bvh파일을 렌더링하는 스크립트이다. 
### rendering
1. initialise.
2. camera의 position을 정해준다.
3. uniform matrix들을 정의해준다. -> proj_matrix, view_matrix, transform_matrix
4. GLSL로 값을 전달한다.
5. vertex data를 bvh의 vertices[frame]에서 가져온다.
6. vbo로 vertex data를 전달한다.
7. attirbute pointer를 지정한다.
8. indices data를 bvh의 indices에서 가져온다.
9. ibo로 indices로 전달한다.
10. drawElements로 line을 그린다.

shader.js
---------
rendering을 하는데에 필요한 shader를 정의하는 곳이다.

event.js
--------
canvas의 event를 관리하는 곳이다.
드래그 event는 여기서 실행된다.