#!/bin/bash
# Task #2 Part 3 — starts the CloudWatch agent after EB's own deployment steps.
#
# EB's built-in "Log Streaming" feature also manages amazon-cloudwatch-agent.service
# and stops it during every deploy when Log Streaming is disabled (which happens in
# the PreBuild phase, right after .ebextensions commands run). Starting the agent
# here in postdeploy — the last hook EB runs — means nothing stops it afterward.
/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -s -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json
