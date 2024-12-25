#!/bin/sh
# wait-for-mysql.sh

set -e

host="$1"
shift
cmd="$@"

until nc -z -v -w30 "$host" 3306
do
  echo "Waiting for MySQL to be ready... (${host}:3306)"
  sleep 2
done

echo "MySQL is up - executing command"
exec $cmd
