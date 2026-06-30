/*
 * example.cs
 *
 * Copyright (c) 2026 DangerDan9631. All rights reserved.
 * Licensed under the MIT License.
 * See https://opensource.org/licenses/MIT for full license information.
 */

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Example.Preview;

/// <summary>
/// A small service used by the theme preview to exercise C# syntax scopes.
/// </summary>
public interface IPreviewService<T>
{
    /// <summary>
    /// Loads a set of preview items.
    /// </summary>
    Task<IReadOnlyList<T>> LoadAsync(string? filter, CancellationToken cancellationToken);
}

/// <summary>
/// Describes the current preview state.
/// </summary>
public enum PreviewState
{
    Unknown,
    Loading,
    Ready,
    Failed,
}

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public sealed class PreviewAttribute(string name) : Attribute
{
    public string Name { get; } = name;
}

[Preview("CSharp")]
public sealed class PreviewService : IPreviewService<PreviewItem>
{
    private const int MaxPreviewCount = 8;
    private static readonly string[] Tags = ["class", "async", "linq"];

    private readonly List<PreviewItem> items = [];

    public PreviewState State { get; private set; } = PreviewState.Unknown;

    public async Task<IReadOnlyList<PreviewItem>> LoadAsync(
        string? filter,
        CancellationToken cancellationToken)
    {
        State = PreviewState.Loading;

        await Task.Delay(TimeSpan.FromMilliseconds(25), cancellationToken);

        var query =
            from tag in Tags
            where filter is null || tag.Contains(filter, StringComparison.OrdinalIgnoreCase)
            select new PreviewItem(tag, $"Loaded {tag}", tag.Length);

        items.Clear();
        items.AddRange(query.Take(MaxPreviewCount));
        State = items.Count > 0 ? PreviewState.Ready : PreviewState.Failed;

        return items;
    }

    public string Format(PreviewItem item) =>
        item switch
        {
            { Weight: > 4 } weighted => $"{weighted.Title}: {weighted.Weight:N0}",
            { Title.Length: 0 } => "Untitled",
            _ => item.Title,
        };
}

public readonly record struct PreviewItem(string Key, string Title, int Weight);
