#! /bin/bash
#
# run.sh -- build and optionally test the software in this repo via docker
#
# type "run.sh -h" to see detailed help
#
prog=`basename $0`
execdir=`dirname $0`
[ "$execdir" = "" -o "$execdir" = "." ] && execdir=$PWD
codedir=`(cd $execdir/.. > /dev/null 2>&1; pwd)`
os=`uname`
SED_RE_OPT=r
[ "$os" != "Darwin" ] || SED_RE_OPT=E

ang_dists=midas-portal
py_dists=midas-nps
avail_dists="$ang_dists $py_dists"

function usage {
    cat <<EOF

$prog - build and optionally test the software in this repo via docker

SYNOPSIS
  $prog [-d|--docker-build] [--dist-dir DIR] [CMD ...] 
        [DISTNAME|angular|python ...] 
        

ARGS:
  angular   apply commands to just the angular distributions
  python    apply commands to just the python distributions

DISTNAMES:  midas-portal, midas-nps

CMDs:
  build     build the software
  test      build the software and run the unit tests
  install   just install the prerequisites (use with shell)
  shell     start a shell in the docker container used to build and test

OPTIONS
  -d        build the required docker containers first
  -t TESTCL include the TESTCL class of tests when testing; as some classes
            of tests are skipped by default, this parameter provides a means 
            of turning them on.
EOF
}

function wordin {
    word=$1
    shift

    echo "$@" | grep -qsw "$word"
}
function docker_images_built {
    for image in "$@"; do
        (docker images | grep -qs $image) || {
            return 1
        }
    done
    return 0
}

set -e

distvol=
distdir=
dodockbuild=
cmds=
comptypes=
args=()
dargs=()
pyargs=()
angargs=()
dists=()
testcl=()
while [ "$1" != "" ]; do
    case "$1" in
        -d|--docker-build)
            dodockbuild=1
            ;;
        --dist-dir)
            shift
            distdir="$1"
            mkdir -p $distdir
            distdir=`(cd $distdir > /dev/null 2>&1; pwd)`
            distvol="-v ${distdir}:/app/dist"
            args=(${args[@]} "--dist-dir=/app/dist")
            ;;
        --dist-dir=*)
            distdir=`echo $1 | sed -e 's/[^=]*=//'`
            mkdir -p $distdir
            distdir=`(cd $distdir > /dev/null 2>&1; pwd)`
            distvol="-v ${distdir}:/app/dist"
            args=(${args[@]} "--dist-dir=/app/dist")
            ;;
        -t|--incl-tests)
            shift
            testcl=(${testcl[@]} $1)
            ;;
        --incl-tests=*)
            testcl=(${testcl[@]} `echo $1 | sed -e 's/[^=]*=//'`)
            ;;
        -h|--help)
            usage
            exit
            ;;
        -*)
            args=(${args[@]} $1)
            ;;
        python|midas-portal|npsbroker)
            comptypes="$comptypes $1"
            ;;
        angular)
            set -- "$@" $ang_dists
            ;;
        npsbroker)
            wordin python $comptypes || comptypes="$comptypes npsbroker"
            pyargs=(${pyargs[@]} $1)
            ;;
        build|install|test|shell)
            cmds="$cmds $1"
            ;;
        *)
            echo Unsupported command: $1
            false
            ;;
    esac
    shift
done

[ -z "$distvol" ] || dargs=(${dargs[@]} "$distvol")
[ -z "${testcl[@]}" ] || {
    dargs=(${dargs[@]} --env OAR_TEST_INCLUDE=\"${testcl[@]}\")
}

dists=`echo $dists`
cmds=`echo $cmds`
[ -n "$dists" ] || dists="$ang_dists"
[ -n "$cmds" ] || cmds="build"
echo "run.sh: Running docker commands [$cmds] on [$dists]"

testopts="--cap-add SYS_ADMIN"
volopt="-v ${codedir}:/dev/oar-midas-portal"

# check to see if we need to build the docker images; this can't detect
# changes requiring re-builds.
# 
if [ -z "$dodockbuild" ]; then
    if wordin midas-portal $dists; then
        if wordin build $cmds; then
            docker_images_built oar-midas-portal/midas-portal || dodockbuild=1
        fi
    fi
fi

        
[ -z "$dodockbuild" ] || {
    echo '#' Building missing docker containers...
    $execdir/dockbuild.sh
}


echo "Check the arguments... $1"
if wordin midas-portal $comptypes; then
    docmds=`echo $cmds | sed -${SED_RE_OPT}e 's/shell//' -e 's/install//' -e 's/^ +$//'`
    if { wordin shell $cmds && [ "$comptypes" == "editable" ]; }; then
        docmds="$docmds shell"
    fi

    if [ -n "$py_req" ]; then
        echo '+' docker run --rm $volopt "${dargs[@]}" oar-midas-portal/midas-nps \
                        test "${args[@]}" $py_dists
        docker run --rm $volopt "${dargs[@]}" oar-midas-portal/midas-nps \
               test "${args[@]}" $py_dists
    fi

fi
#If we need to add more python packaging etc and use dockers we can user it
# This is not used right now
# if wordin npsbroker $comptypes; then
#     docmds=`echo $cmds | sed -${SED_RE_OPT}e 's/shell//' -e 's/install//' -e 's/^ +$//'`
#     if { wordin shell $cmds && [ "$comptypes" == "nps" ]; }; then
#         docmds="$docmds shell"
#     fi

#     if [ "$docmds" == "build" ]; then
#         # build only
#         echo '+' docker run --rm $volopt "${dargs[@]}" oar-midas-portal/npsbroker build \
#                        "${args[@]}" "${angargs[@]} -p 9092:9092"
#         docker run --rm $volopt "${dargs[@]}" -p 9092:9092 oar-midas-portal/npsbroker build \
#                        "${args[@]}" "${angargs[@]}" 
#     fi
# fi

