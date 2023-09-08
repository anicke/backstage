# jira

The Jira plugin can be enabled by setting the project key of your Jira project as the following example shows. If
you want to track a specific component or filter in that project you can use the optional "component" and `filters-ids`
annotations. To specify the filter ids get the ids of the wanted filters (it's an integer) and use `:` as the separator.
The default filters will not be shown if the `filters-ids` annotation is used.

```yaml
annotations:
  jira/project-key: PROJECT-KEY
  jira/component: component-name
  jira/filter-ids: 12345:67890
```
