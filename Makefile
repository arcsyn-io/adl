.PHONY: build up down shell install dev test test-unit test-e2e lint typecheck logs clean

build up down shell install dev test test-unit test-e2e lint typecheck logs clean:
	./scripts/adl.sh $@

exec:
	./scripts/adl.sh exec $(CMD)
