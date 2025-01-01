#!/bin/sh
# wait-for-mysql.sh

set -e

host="$1"
shift
cmd="$@"

echo "🔄 Waiting for MySQL to be ready on $host:3306..."
until nc -z -v -w30 "$host" 3306; do
  echo "⏳ Still waiting for MySQL... Will retry in 1 second"
  sleep 1
done

echo "✅ MySQL is up and running!"
echo "🚀 Executing command: $cmd"

exec $cmd