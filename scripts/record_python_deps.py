#! /usr/bin/env python3
#
#
from __future__ import print_function
import os, sys, json
from collections import OrderedDict
import subprocess as subproc
import traceback as tb

prog = os.path.basename(sys.argv[0])
execdir = os.path.dirname(sys.argv.pop(0))
pkgdir = os.path.dirname(execdir)
omddir = os.path.join(pkgdir, "oar-midas-portal")
omdscr = os.path.join(omddir, "scripts")
pkgname = os.environ.get('PACKAGE_NAME', 'oar-midas-portal')

def usage():
    print("Usage: %s DISTNAME VERSION" % prog, file=sys.stderr)

def fail(msg, excode=1):
    print(prog + ": " + msg, file=sys.stderr)
    sys.exit(excode)

def oarmvers():
    namever = ["npsbroker", "(unknown)"]
    try:
        with open(os.path.join(omddir, "VERSION")) as fd:
            namever = fd.readline().strip().split(1)
    except Exception:
        pass
    return namever

def make_depdata(compname, pkgver):
    deps = OrderedDict([
        (pkgname, OrderedDict([ ("version", pkgver) ]))
    ])

    data = OrderedDict([
        ("name", compname),
        ("version", pkgver),
        ("dependencies", deps)
    ])
    return data

if len(sys.argv) < 2:
    usage()
    fail("Missing arguments -- need 2")
    
distname = sys.argv.pop(0)
distvers = sys.argv.pop(0)
    
data = make_depdata(distname, distvers)
json.dump(data, sys.stdout, indent=2)