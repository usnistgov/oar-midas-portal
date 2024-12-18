#! /bin/bash
#
# dockbuild.sh:  build all docker images in this directory
#
# Usage: dockbuild.sh [-h|--help] [-l LOGFILE] [-q] [image_dir ...]
#
# where an image_dir can be one of,
#    pymongo jq ejsonschema pdrtest pdrangular angtest
#
prog=`basename $0`
execdir=`dirname $0`
[ "$execdir" = "" -o "$execdir" = "." ] && execdir=$PWD
codedir=`(cd $execdir/.. > /dev/null 2>&1; pwd)`
set -e

## These are set by default via _dockbuild.sh; if necessary, uncomment and
## customize:
#
PACKAGE_NAME=oar-midas-portal
# 
## list the names of the image directories (each containing a Dockerfile) for
## containers to be built.  List them in dependency order (where a latter one
## depends the former ones).  
#
DOCKER_IMAGE_DIRS="midas-portal npsbroker"

. $codedir/oar-build/_dockbuild.sh

# Override, if need be, the UID of the user to run as in the container; the 
# default is the user running this script.
#
# OAR_DOCKER_UID=

# set BUILD_OPTS and BUILD_IMAGES
# 
setup_build

log_intro   # record start of build into log

if { echo " $BUILD_IMAGES " | egrep -qs " midas-portal "; }; then
    # install CA certs into containers that can use them
    cp_ca_certs_to midas-portal

    echo '+' docker build $BUILD_OPTS -t $PACKAGE_NAME/midas-portal midas-portal
    docker build $BUILD_OPTS -t $PACKAGE_NAME/midas-portal midas-portal 2>&1
fi

if { echo " $BUILD_IMAGES " | egrep -qs " npsbroker "; }; then
    # install CA certs into containers that can use them
    cp_ca_certs_to npsbroker

    echo '+' docker build $BUILD_OPTS -t $PACKAGE_NAME/npsbroker npsbroker
    docker build $BUILD_OPTS -t $PACKAGE_NAME/npsbroker npsbroker 2>&1
fi

