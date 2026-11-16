from django.db import migrations, models


def backfill_bought_on(apps, schema_editor):
    Pantry = apps.get_model("api", "Pantry")
    for item in Pantry.objects.all():
        if item.bought_on is None and item.added_at:
            Pantry.objects.filter(pk=item.pk).update(bought_on=item.added_at.date())


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0002_alter_user_options_remove_recipe_tags_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="pantry",
            name="bought_on",
            field=models.DateField(blank=True, null=True),
        ),
        migrations.RunPython(backfill_bought_on, migrations.RunPython.noop),
    ]
